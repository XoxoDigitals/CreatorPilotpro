import { NextRequest, NextResponse } from "next/server";
import { getAppUrl } from "@/lib/platforms/config";
import {
  isPlatformConfigured,
  resolvePlatformCredentials,
} from "@/lib/platforms/credentials";

export async function GET(request: NextRequest) {
  const redirectUri = `${getAppUrl()}/api/auth/facebook/callback`;

  if (!isPlatformConfigured(request, "facebook")) {
    return NextResponse.redirect(
      `${getAppUrl()}/dashboard/accounts?error=facebook_not_configured`
    );
  }

  const { clientId } = resolvePlatformCredentials(request, "facebook")!;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "pages_show_list,pages_manage_posts,pages_read_engagement,pages_manage_metadata",
    response_type: "code",
  });

  return NextResponse.redirect(
    `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`
  );
}
