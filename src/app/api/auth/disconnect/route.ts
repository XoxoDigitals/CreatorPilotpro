import { NextRequest, NextResponse } from "next/server";
import { clearPlatformAuth } from "@/lib/platforms/platform-tokens";
import type { Platform } from "@/lib/types";

const PLATFORMS = new Set<Platform>(["youtube", "tiktok", "facebook"]);

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { platform?: Platform };
    if (!body.platform || !PLATFORMS.has(body.platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true });
    clearPlatformAuth(response, body.platform);
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
