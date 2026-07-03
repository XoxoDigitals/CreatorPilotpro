import { NextRequest, NextResponse } from "next/server";
import {
  getConnectedAccountProfile,
  getPlatformAuth,
} from "@/lib/platforms/platform-tokens";
import type { Platform } from "@/lib/types";

const PLATFORMS: Platform[] = ["youtube", "tiktok", "facebook"];

export async function GET(request: NextRequest) {
  const accounts = PLATFORMS.flatMap((platform) => {
    const profile = getConnectedAccountProfile(request, platform);
    const auth = getPlatformAuth(request, platform);

    if (!profile && !auth?.accessToken) return [];

    return [
      {
        platform,
        name: profile?.name ?? auth?.name ?? `${platform} account`,
        handle: profile?.handle ?? auth?.handle ?? `@${platform}`,
        connectedAt: profile?.connectedAt ?? new Date().toISOString(),
      },
    ];
  });

  return NextResponse.json({ accounts });
}
