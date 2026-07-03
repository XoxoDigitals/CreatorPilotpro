import { NextRequest, NextResponse } from "next/server";
import { getAppUrl } from "@/lib/platforms/config";
import {
  isPlatformConfigured,
  resolvePlatformCredentials,
} from "@/lib/platforms/credentials";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const redirectUri = `${getAppUrl()}/api/auth/tiktok/callback`;

  if (!isPlatformConfigured(request, "tiktok")) {
    return NextResponse.redirect(
      `${getAppUrl()}/dashboard/accounts?error=tiktok_not_configured`
    );
  }

  const { clientId } = resolvePlatformCredentials(request, "tiktok")!;
  const csrfState = crypto.randomBytes(16).toString("hex");
  const params = new URLSearchParams({
    client_key: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "user.info.basic,video.upload,video.publish",
    state: csrfState,
  });

  const response = NextResponse.redirect(
    `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
  );
  response.cookies.set("tiktok_oauth_state", csrfState, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
  });

  return response;
}
