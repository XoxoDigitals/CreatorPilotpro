import { NextRequest, NextResponse } from "next/server";
import { getAppUrl } from "@/lib/platforms/config";
import {
  isPlatformConfigured,
  resolvePlatformCredentials,
} from "@/lib/platforms/credentials";

export async function GET(request: NextRequest) {
  const redirectUri = `${getAppUrl()}/api/auth/youtube/callback`;

  if (!isPlatformConfigured(request, "youtube")) {
    return NextResponse.redirect(
      `${getAppUrl()}/dashboard/accounts?error=youtube_not_configured`
    );
  }

  const { clientId } = resolvePlatformCredentials(request, "youtube")!;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/youtube.upload",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
