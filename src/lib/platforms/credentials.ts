import type { NextRequest } from "next/server";
import type { Platform } from "@/lib/types";

export interface PlatformCredentials {
  clientId: string;
  clientSecret: string;
}

export interface ApiCredentialsPayload {
  googleClientId?: string;
  googleClientSecret?: string;
  tiktokClientKey?: string;
  tiktokClientSecret?: string;
  facebookAppId?: string;
  facebookAppSecret?: string;
}

export const CREDENTIAL_COOKIE_NAMES = {
  googleClientId: "cpp_google_client_id",
  googleClientSecret: "cpp_google_client_secret",
  tiktokClientKey: "cpp_tiktok_client_key",
  tiktokClientSecret: "cpp_tiktok_client_secret",
  facebookAppId: "cpp_facebook_app_id",
  facebookAppSecret: "cpp_facebook_app_secret",
} as const;

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function credentialCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

function fromEnv(platform: Platform): PlatformCredentials | null {
  switch (platform) {
    case "youtube": {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      if (clientId && clientSecret) return { clientId, clientSecret };
      break;
    }
    case "tiktok": {
      const clientId = process.env.TIKTOK_CLIENT_KEY;
      const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
      if (clientId && clientSecret) return { clientId, clientSecret };
      break;
    }
    case "facebook": {
      const clientId = process.env.FACEBOOK_APP_ID;
      const clientSecret = process.env.FACEBOOK_APP_SECRET;
      if (clientId && clientSecret) return { clientId, clientSecret };
      break;
    }
  }
  return null;
}

function fromCookies(
  request: NextRequest,
  platform: Platform
): PlatformCredentials | null {
  const c = request.cookies;
  switch (platform) {
    case "youtube": {
      const clientId = c.get(CREDENTIAL_COOKIE_NAMES.googleClientId)?.value;
      const clientSecret = c.get(CREDENTIAL_COOKIE_NAMES.googleClientSecret)?.value;
      if (clientId && clientSecret) return { clientId, clientSecret };
      break;
    }
    case "tiktok": {
      const clientId = c.get(CREDENTIAL_COOKIE_NAMES.tiktokClientKey)?.value;
      const clientSecret = c.get(CREDENTIAL_COOKIE_NAMES.tiktokClientSecret)?.value;
      if (clientId && clientSecret) return { clientId, clientSecret };
      break;
    }
    case "facebook": {
      const clientId = c.get(CREDENTIAL_COOKIE_NAMES.facebookAppId)?.value;
      const clientSecret = c.get(CREDENTIAL_COOKIE_NAMES.facebookAppSecret)?.value;
      if (clientId && clientSecret) return { clientId, clientSecret };
      break;
    }
  }
  return null;
}

export function resolvePlatformCredentials(
  request: NextRequest,
  platform: Platform
): PlatformCredentials | null {
  return fromCookies(request, platform) ?? fromEnv(platform);
}

export function isPlatformConfigured(
  request: NextRequest,
  platform: Platform
): boolean {
  return resolvePlatformCredentials(request, platform) !== null;
}

export function getConfiguredPlatforms(request: NextRequest): Record<Platform, boolean> {
  return {
    youtube: isPlatformConfigured(request, "youtube"),
    tiktok: isPlatformConfigured(request, "tiktok"),
    facebook: isPlatformConfigured(request, "facebook"),
  };
}

export function resolveFacebookAppSecret(request: NextRequest): string {
  return (
    request.cookies.get(CREDENTIAL_COOKIE_NAMES.facebookAppSecret)?.value ??
    process.env.FACEBOOK_APP_SECRET ??
    ""
  );
}
