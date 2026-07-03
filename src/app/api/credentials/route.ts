import { NextRequest, NextResponse } from "next/server";
import {
  CREDENTIAL_COOKIE_NAMES,
  credentialCookieOptions,
  getConfiguredPlatforms,
} from "@/lib/platforms/credentials";
import type { StoredApiCredentials } from "@/lib/stores/api-credentials-store";

function setIfPresent(
  response: NextResponse,
  name: string,
  value: string | undefined
) {
  if (value?.trim()) {
    response.cookies.set(name, value.trim(), credentialCookieOptions());
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    configured: getConfiguredPlatforms(request),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as StoredApiCredentials;
    const response = NextResponse.json({
      ok: true,
      configured: {
        youtube: Boolean(body.googleClientId?.trim() && body.googleClientSecret?.trim()),
        tiktok: Boolean(body.tiktokClientKey?.trim() && body.tiktokClientSecret?.trim()),
        facebook: Boolean(body.facebookAppId?.trim() && body.facebookAppSecret?.trim()),
      },
    });

    setIfPresent(response, CREDENTIAL_COOKIE_NAMES.googleClientId, body.googleClientId);
    setIfPresent(response, CREDENTIAL_COOKIE_NAMES.googleClientSecret, body.googleClientSecret);
    setIfPresent(response, CREDENTIAL_COOKIE_NAMES.tiktokClientKey, body.tiktokClientKey);
    setIfPresent(response, CREDENTIAL_COOKIE_NAMES.tiktokClientSecret, body.tiktokClientSecret);
    setIfPresent(response, CREDENTIAL_COOKIE_NAMES.facebookAppId, body.facebookAppId);
    setIfPresent(response, CREDENTIAL_COOKIE_NAMES.facebookAppSecret, body.facebookAppSecret);

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  const opts = { ...credentialCookieOptions(), maxAge: 0 };

  for (const name of Object.values(CREDENTIAL_COOKIE_NAMES)) {
    response.cookies.set(name, "", opts);
  }

  return response;
}
