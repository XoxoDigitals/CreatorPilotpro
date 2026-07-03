import { NextRequest, NextResponse } from "next/server";
import { getAppUrl } from "@/lib/platforms/config";
import { resolvePlatformCredentials } from "@/lib/platforms/credentials";
import { savePlatformAuth } from "@/lib/platforms/platform-tokens";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get("tiktok_oauth_state")?.value;
  const base = `${getAppUrl()}/dashboard/accounts`;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(`${base}?error=tiktok_auth_failed`);
  }

  const creds = resolvePlatformCredentials(request, "tiktok");
  const redirectUri = `${getAppUrl()}/api/auth/tiktok/callback`;

  if (!creds) {
    return NextResponse.redirect(`${base}?error=tiktok_not_configured`);
  }

  try {
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: creds.clientId,
        client_secret: creds.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${base}?error=tiktok_token_failed`);
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;

    let displayName = "TikTok Account";
    let username = "tiktok";
    if (accessToken) {
      const userRes = await fetch(
        "https://open.tiktokapis.com/v2/user/info/?fields=display_name,username",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (userRes.ok) {
        const userData = await userRes.json();
        const user = userData.data?.user;
        username = user?.username ?? username;
        displayName = user?.display_name ?? username ?? displayName;
      }
    }

    const handle = `@${String(username).replace(/^@/, "")}`;
    const params = new URLSearchParams({
      connected: "tiktok",
      name: displayName,
      handle,
      sandbox: "false",
    });

    const response = NextResponse.redirect(`${base}?${params.toString()}`);
    response.cookies.delete("tiktok_oauth_state");
    savePlatformAuth(response, "tiktok", {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + (tokens.expires_in ?? 3600) * 1000,
      handle,
      name: displayName,
    });
    return response;
  } catch {
    return NextResponse.redirect(`${base}?error=tiktok_auth_error`);
  }
}
