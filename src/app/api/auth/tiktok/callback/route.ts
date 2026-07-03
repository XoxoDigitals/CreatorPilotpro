import { NextRequest, NextResponse } from "next/server";
import { getAppUrlFromRequest } from "@/lib/platforms/config";
import { resolvePlatformCredentials } from "@/lib/platforms/credentials";
import { appendOAuthLog } from "@/lib/platforms/oauth-debug";
import { savePlatformAuth } from "@/lib/platforms/platform-tokens";

function getTikTokApiError(raw: unknown): string {
  if (!raw || typeof raw !== "object") return "";
  const body = raw as Record<string, unknown>;
  if (body.error_description) return String(body.error_description);
  const err = body.error;
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message?: string }).message);
  }
  if (typeof err === "string") return err;
  return "";
}

function parseTikTokTokenPayload(raw: unknown): {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
} {
  if (!raw || typeof raw !== "object") return {};
  const body = raw as Record<string, unknown>;
  const nested = body.data;
  if (nested && typeof nested === "object") {
    return nested as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
    };
  }
  return body as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
}

export async function GET(request: NextRequest) {
  const appUrl = getAppUrlFromRequest(request);
  const base = `${appUrl}/dashboard/accounts`;
  appendOAuthLog("tiktok callback started");

  const oauthError = request.nextUrl.searchParams.get("error");
  const oauthErrorDesc = request.nextUrl.searchParams.get("error_description");

  if (oauthError) {
    appendOAuthLog(`tiktok denied by user: ${oauthError} ${oauthErrorDesc ?? ""}`);
    const detail = oauthErrorDesc
      ? encodeURIComponent(oauthErrorDesc.slice(0, 200))
      : "";
    return NextResponse.redirect(
      `${base}?error=tiktok_denied${detail ? `&detail=${detail}` : ""}`
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get("tiktok_oauth_state")?.value;

  if (!code || !state || state !== storedState) {
    const reason = !code ? "no_code" : !state ? "no_state" : "state_mismatch";
    appendOAuthLog(
      `tiktok auth failed: ${reason} (hasStoredState=${Boolean(storedState)})`
    );
    return NextResponse.redirect(`${base}?error=tiktok_auth_failed&detail=${reason}`);
  }

  const creds = resolvePlatformCredentials(request, "tiktok");
  const redirectUri = `${appUrl}/api/auth/tiktok/callback`;

  if (!creds) {
    appendOAuthLog("tiktok callback: credentials missing");
    return NextResponse.redirect(`${base}?error=tiktok_not_configured`);
  }

  try {
    appendOAuthLog(`tiktok token exchange redirect_uri=${redirectUri}`);
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

    const tokenJson = await tokenRes.json().catch(() => null);
    const tokens = parseTikTokTokenPayload(tokenJson);

    if (!tokenRes.ok || !tokens.access_token) {
      const apiMsg = getTikTokApiError(tokenJson);
      appendOAuthLog(`tiktok token failed: status=${tokenRes.status} msg=${apiMsg}`);
      const detail = apiMsg ? encodeURIComponent(apiMsg.slice(0, 200)) : "";
      return NextResponse.redirect(
        `${base}?error=tiktok_token_failed${detail ? `&detail=${detail}` : ""}`
      );
    }

    appendOAuthLog("tiktok token received, fetching user profile");
    const accessToken = tokens.access_token;

    let displayName = "TikTok Account";
    let username = "";
    let openId = "";
    const userRes = await fetch(
      "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,username",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (userRes.ok) {
      const userData = await userRes.json();
      const user = userData.data?.user;
      openId = user?.open_id ?? "";
      username = user?.username ?? "";
      displayName = user?.display_name ?? displayName;
      appendOAuthLog(
        `tiktok user ok: display=${displayName} username=${username || "n/a"}`
      );
    } else {
      appendOAuthLog(`tiktok user info failed: status=${userRes.status}`);
    }

    const handleSource =
      username ||
      displayName.replace(/\s+/g, "").toLowerCase() ||
      (openId ? `user_${openId.slice(-8)}` : "tiktok");
    const handle = `@${String(handleSource).replace(/^@/, "")}`;

    const params = new URLSearchParams({
      connected: "tiktok",
      name: displayName,
      handle,
      sandbox: "false",
    });

    const redirectUrl = `${base}?${params.toString()}`;
    appendOAuthLog(`tiktok success → redirect ${handle} (tokens saved to server file)`);

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete("tiktok_oauth_state");
    savePlatformAuth(response, "tiktok", {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + (tokens.expires_in ?? 3600) * 1000,
      handle,
      name: displayName,
    });
    return response;
  } catch (error) {
    appendOAuthLog(
      `tiktok callback exception: ${error instanceof Error ? error.message : "unknown"}`
    );
    return NextResponse.redirect(`${base}?error=tiktok_auth_error`);
  }
}
