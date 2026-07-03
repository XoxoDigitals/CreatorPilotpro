import type { NextRequest, NextResponse } from "next/server";
import type { Platform } from "@/lib/types";
import { credentialCookieOptions, resolvePlatformCredentials } from "./credentials";
import {
  clearServerPlatformAuth,
  getServerPlatformAuth,
  saveServerPlatformAuth,
} from "./server-token-store";

export interface StoredPlatformAuth {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  handle: string;
  name: string;
  channelId?: string;
  pageId?: string;
}

export interface ConnectedAccountProfile {
  name: string;
  handle: string;
  connectedAt: string;
}

/** Legacy cookie — tokens moved to .data/platform-tokens.json (cookies have 4KB limit). */
const TOKEN_COOKIE: Record<Platform, string> = {
  youtube: "cpp_auth_youtube",
  tiktok: "cpp_auth_tiktok",
  facebook: "cpp_auth_facebook",
};

const CONNECTED_COOKIE: Record<Platform, string> = {
  youtube: "cpp_connected_youtube",
  tiktok: "cpp_connected_tiktok",
  facebook: "cpp_connected_facebook",
};

function readLegacyCookieAuth(
  request: NextRequest,
  platform: Platform
): StoredPlatformAuth | null {
  const raw = request.cookies.get(TOKEN_COOKIE[platform])?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredPlatformAuth;
  } catch {
    return null;
  }
}

export function getConnectedAccountProfile(
  request: NextRequest,
  platform: Platform
): ConnectedAccountProfile | null {
  const raw = request.cookies.get(CONNECTED_COOKIE[platform])?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ConnectedAccountProfile;
  } catch {
    return null;
  }
}

export function savePlatformAuth(
  response: NextResponse,
  platform: Platform,
  auth: StoredPlatformAuth
): void {
  saveServerPlatformAuth(platform, auth);

  response.cookies.set(
    CONNECTED_COOKIE[platform],
    JSON.stringify({
      name: auth.name,
      handle: auth.handle,
      connectedAt: new Date().toISOString(),
    } satisfies ConnectedAccountProfile),
    credentialCookieOptions()
  );

  response.cookies.set(TOKEN_COOKIE[platform], "", {
    ...credentialCookieOptions(),
    maxAge: 0,
  });
}

export function clearPlatformAuth(
  response: NextResponse,
  platform: Platform
): void {
  clearServerPlatformAuth(platform);
  response.cookies.set(CONNECTED_COOKIE[platform], "", {
    ...credentialCookieOptions(),
    maxAge: 0,
  });
  response.cookies.set(TOKEN_COOKIE[platform], "", {
    ...credentialCookieOptions(),
    maxAge: 0,
  });
}

export function getPlatformAuth(
  request: NextRequest,
  platform: Platform
): StoredPlatformAuth | null {
  const fromFile = getServerPlatformAuth(platform);
  if (fromFile?.accessToken) return fromFile;

  const legacy = readLegacyCookieAuth(request, platform);
  if (legacy?.accessToken) {
    saveServerPlatformAuth(platform, legacy);
    return legacy;
  }

  return null;
}

export function hasPlatformAuth(
  request: NextRequest,
  platform: Platform
): boolean {
  return getPlatformAuth(request, platform) !== null;
}

async function refreshYouTubeAccessToken(
  request: NextRequest,
  auth: StoredPlatformAuth
): Promise<StoredPlatformAuth | null> {
  if (!auth.refreshToken) return null;

  const creds = resolvePlatformCredentials(request, "youtube");
  if (!creds) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      refresh_token: auth.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) return null;

  const tokens = await res.json();
  return {
    ...auth,
    accessToken: tokens.access_token,
    expiresAt: Date.now() + (tokens.expires_in ?? 3600) * 1000,
  };
}

export async function getYouTubeAccessToken(
  request: NextRequest
): Promise<{ token: string; auth: StoredPlatformAuth } | null> {
  let auth = getPlatformAuth(request, "youtube");
  if (!auth) return null;

  const expired = auth.expiresAt ? Date.now() >= auth.expiresAt - 60_000 : false;
  if (expired) {
    const refreshed = await refreshYouTubeAccessToken(request, auth);
    if (!refreshed) return null;
    auth = refreshed;
    saveServerPlatformAuth("youtube", auth);
  }

  return { token: auth.accessToken, auth };
}

async function refreshTikTokAccessToken(
  request: NextRequest,
  auth: StoredPlatformAuth
): Promise<StoredPlatformAuth | null> {
  if (!auth.refreshToken) return null;

  const creds = resolvePlatformCredentials(request, "tiktok");
  if (!creds) return null;

  const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: creds.clientId,
      client_secret: creds.clientSecret,
      grant_type: "refresh_token",
      refresh_token: auth.refreshToken,
    }),
  });

  if (!res.ok) return null;

  const raw = await res.json();
  const tokens =
    raw?.data && typeof raw.data === "object" ? raw.data : raw;
  return {
    ...auth,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? auth.refreshToken,
    expiresAt: Date.now() + (tokens.expires_in ?? 3600) * 1000,
  };
}

export async function getTikTokAccessToken(
  request: NextRequest
): Promise<{ token: string; auth: StoredPlatformAuth } | null> {
  let auth = getPlatformAuth(request, "tiktok");
  if (!auth) return null;

  const expired = auth.expiresAt ? Date.now() >= auth.expiresAt - 60_000 : false;
  if (expired) {
    const refreshed = await refreshTikTokAccessToken(request, auth);
    if (!refreshed) return null;
    auth = refreshed;
    saveServerPlatformAuth("tiktok", auth);
  }

  return { token: auth.accessToken, auth };
}

export async function getFacebookPageAuth(
  request: NextRequest
): Promise<{ pageId: string; pageAccessToken: string; auth: StoredPlatformAuth } | null> {
  const auth = getPlatformAuth(request, "facebook");
  if (!auth?.pageId || !auth.accessToken) return null;

  return {
    pageId: auth.pageId,
    pageAccessToken: auth.accessToken,
    auth,
  };
}
