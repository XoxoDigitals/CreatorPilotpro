import type { NextRequest } from "next/server";
import type { Platform } from "@/lib/types";

export interface PlatformConfig {
  id: Platform;
  name: string;
  authPath: string;
  scopes: string[];
  sandboxNote: string;
}

export function getPlatformConfigs(): PlatformConfig[] {
  return [
    {
      id: "youtube",
      name: "YouTube",
      authPath: "/api/auth/youtube",
      scopes: [
        "https://www.googleapis.com/auth/youtube.upload",
        "https://www.googleapis.com/auth/youtube.readonly",
      ],
      sandboxNote:
        "Paste your Google Client ID and Secret in Settings → API keys, or add them to .env.local.",
    },
    {
      id: "tiktok",
      name: "TikTok",
      authPath: "/api/auth/tiktok",
      scopes: ["user.info.basic", "user.info.profile", "video.upload", "video.publish"],
      sandboxNote:
        "Paste your TikTok Client Key and Secret in Settings → API keys, or add them to .env.local.",
    },
    {
      id: "facebook",
      name: "Facebook",
      authPath: "/api/auth/facebook",
      scopes: [
        "pages_show_list",
        "pages_manage_posts",
        "pages_read_engagement",
        "pages_manage_metadata",
      ],
      sandboxNote:
        "Paste your Facebook App ID and Secret in Settings → API keys, or add them to .env.local.",
    },
  ];
}

export function getAppUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (envUrl) return envUrl;
  return "http://localhost:3000";
}

/** Prefer env URL; fall back to the incoming request host (needed on production). */
export function getAppUrlFromRequest(request: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (envUrl) return envUrl;

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host =
    forwardedHost?.split(",")[0]?.trim() || request.headers.get("host");
  if (host) {
    const proto =
      request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
      (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }

  return getAppUrl();
}
