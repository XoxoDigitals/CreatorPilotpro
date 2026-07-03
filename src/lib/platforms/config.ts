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
      scopes: ["video.upload", "video.publish", "user.info.basic"],
      sandboxNote:
        "Paste your TikTok Client Key and Secret in Settings → API keys, or add them to .env.local.",
    },
    {
      id: "facebook",
      name: "Facebook",
      authPath: "/api/auth/facebook",
      scopes: [
        "pages_manage_posts",
        "pages_read_engagement",
        "pages_show_list",
        "publish_video",
      ],
      sandboxNote:
        "Paste your Facebook App ID and Secret in Settings → API keys, or add them to .env.local.",
    },
  ];
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
