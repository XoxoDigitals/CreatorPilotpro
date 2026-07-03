import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const platform = searchParams.get("connected");
  const name = searchParams.get("name");

  if (!platform || !name) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({
    platform,
    name,
    message: "Account connected. Refresh the accounts page to see it in your list.",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ received: true, ...body });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}
