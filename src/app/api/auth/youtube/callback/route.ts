import { NextRequest, NextResponse } from "next/server";
import { getAppUrl } from "@/lib/platforms/config";
import { resolvePlatformCredentials } from "@/lib/platforms/credentials";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const base = `${getAppUrl()}/dashboard/accounts`;

  if (error || !code) {
    return NextResponse.redirect(`${base}?error=youtube_auth_failed`);
  }

  const creds = resolvePlatformCredentials(request, "youtube");
  const redirectUri = `${getAppUrl()}/api/auth/youtube/callback`;

  if (!creds) {
    return NextResponse.redirect(`${base}?error=youtube_not_configured`);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${base}?error=youtube_token_failed`);
    }

    const tokens = await tokenRes.json();
    const channelRes = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } }
    );

    let channelName = "YouTube Channel";
    if (channelRes.ok) {
      const data = await channelRes.json();
      channelName = data.items?.[0]?.snippet?.title ?? channelName;
    }

    const params = new URLSearchParams({
      connected: "youtube",
      name: channelName,
      sandbox: "false",
    });

    return NextResponse.redirect(`${base}?${params.toString()}`);
  } catch {
    return NextResponse.redirect(`${base}?error=youtube_auth_error`);
  }
}
