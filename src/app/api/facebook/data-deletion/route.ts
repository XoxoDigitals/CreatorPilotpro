import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { resolveFacebookAppSecret } from "@/lib/platforms/credentials";

export async function POST(request: NextRequest) {
  const body = await request.formData().catch(() => null);
  const signedRequest = body?.get("signed_request")?.toString();

  if (!signedRequest) {
    return NextResponse.json(
      { url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/data-deletion`, confirmation_code: "pending" },
      { status: 200 }
    );
  }

  const appSecret = resolveFacebookAppSecret(request);
  const [encodedSig, payload] = signedRequest.split(".");
  const data = JSON.parse(
    Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
  );

  const expectedSig = crypto
    .createHmac("sha256", appSecret)
    .update(payload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  if (encodedSig !== expectedSig) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const confirmationCode = `DEL-${data.user_id}-${Date.now()}`;
  console.info("[Facebook data deletion]", { userId: data.user_id, confirmationCode });

  return NextResponse.json({
    url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/data-deletion`,
    confirmation_code: confirmationCode,
  });
}
