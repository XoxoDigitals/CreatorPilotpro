import { NextRequest, NextResponse } from "next/server";
import { isPlatformConfigured } from "@/lib/platforms/credentials";
import { readOAuthLogTail, getOAuthLogPath } from "@/lib/platforms/oauth-debug";
import {
  getConnectedAccountProfile,
  getPlatformAuth,
} from "@/lib/platforms/platform-tokens";
import { getServerPlatformAuth } from "@/lib/platforms/server-token-store";
import type { Platform } from "@/lib/types";

const PLATFORMS: Platform[] = ["youtube", "tiktok", "facebook"];

export async function GET(request: NextRequest) {
  const platforms = Object.fromEntries(
    PLATFORMS.map((platform) => {
      const profile = getConnectedAccountProfile(request, platform);
      const auth = getPlatformAuth(request, platform);
      const fileAuth = getServerPlatformAuth(platform);
      return [
        platform,
        {
          apiKeysConfigured: isPlatformConfigured(request, platform),
          profileCookie: Boolean(profile),
          tokenInFile: Boolean(fileAuth?.accessToken),
          tokenAvailable: Boolean(auth?.accessToken),
          name: profile?.name ?? auth?.name ?? null,
          handle: profile?.handle ?? auth?.handle ?? null,
        },
      ];
    })
  );

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    platforms,
    oauthLog: readOAuthLogTail(30),
    oauthLogPath: getOAuthLogPath(),
    helpTextUrl: "/TIKTOK-OAUTH-DEBUG.txt",
  });
}
