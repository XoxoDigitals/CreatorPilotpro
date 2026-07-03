import { NextRequest, NextResponse } from "next/server";
import { getAppUrl } from "@/lib/platforms/config";
import { resolvePlatformCredentials } from "@/lib/platforms/credentials";
import { savePlatformAuth } from "@/lib/platforms/platform-tokens";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const base = `${getAppUrl()}/dashboard/accounts`;

  if (!code) {
    return NextResponse.redirect(`${base}?error=facebook_auth_failed`);
  }

  const creds = resolvePlatformCredentials(request, "facebook");
  const redirectUri = `${getAppUrl()}/api/auth/facebook/callback`;

  if (!creds) {
    return NextResponse.redirect(`${base}?error=facebook_not_configured`);
  }

  try {
    const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
    tokenUrl.searchParams.set("client_id", creds.clientId);
    tokenUrl.searchParams.set("client_secret", creds.clientSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    if (!tokenRes.ok) {
      return NextResponse.redirect(`${base}?error=facebook_token_failed`);
    }

    const tokens = await tokenRes.json();
    const pagesRes = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=name,username,id,access_token&access_token=${tokens.access_token}`
    );

    let pageName = "Facebook Page";
    let pageHandle = "facebook";
    let pageId: string | undefined;
    let pageAccessToken: string | undefined;
    if (pagesRes.ok) {
      const data = await pagesRes.json();
      const page = data.data?.[0];
      pageName = page?.name ?? pageName;
      pageId = page?.id;
      pageAccessToken = page?.access_token;
      const username = page?.username ?? page?.id;
      pageHandle = username
        ? `@${String(username).replace(/^@/, "")}`
        : `@${pageName.replace(/\s+/g, "").toLowerCase()}`;
    }

    if (!pageId || !pageAccessToken) {
      return NextResponse.redirect(`${base}?error=facebook_no_page_found`);
    }

    const params = new URLSearchParams({
      connected: "facebook",
      name: pageName,
      handle: pageHandle,
      sandbox: "false",
    });

    const response = NextResponse.redirect(`${base}?${params.toString()}`);
    savePlatformAuth(response, "facebook", {
      accessToken: pageAccessToken,
      handle: pageHandle,
      name: pageName,
      pageId,
    });
    return response;
  } catch {
    return NextResponse.redirect(`${base}?error=facebook_auth_error`);
  }
}
