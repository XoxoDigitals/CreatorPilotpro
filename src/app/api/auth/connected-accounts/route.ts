import { NextRequest, NextResponse } from "next/server";
import { getPlatformAuth } from "@/lib/platforms/platform-tokens";
import type { Platform } from "@/lib/types";

const PLATFORMS: Platform[] = ["youtube", "tiktok", "facebook"];

export async function GET(request: NextRequest) {
  const accounts = PLATFORMS.flatMap((platform) => {
    const auth = getPlatformAuth(request, platform);
    if (!auth?.accessToken) return [];
    return [
      {
        platform,
        name: auth.name || `${platform} account`,
        handle: auth.handle || `@${platform}`,
      },
    ];
  });

  return NextResponse.json({ accounts });
}
