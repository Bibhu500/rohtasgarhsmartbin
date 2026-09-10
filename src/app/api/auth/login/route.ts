import { NextRequest, NextResponse } from "next/server";
import { signAuthToken, DEFAULT_ADMIN_USER, DEFAULT_ADMIN_PASSWORD } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (
      username.trim() === DEFAULT_ADMIN_USER &&
      password === DEFAULT_ADMIN_PASSWORD
    ) {
      const token = await signAuthToken({
        username: DEFAULT_ADMIN_USER,
        role: "admin",
      });

      const response = NextResponse.json({
        success: true,
        message: "Login successful",
        user: { username: DEFAULT_ADMIN_USER, role: "admin" },
      });

      // Set auth_token cookie (HttpOnly for security)
      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid username or password" },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Login failed: " + error.message },
      { status: 500 }
    );
  }
}
