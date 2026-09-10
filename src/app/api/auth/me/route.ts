import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await verifyAuthToken(token);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user,
  });
}
