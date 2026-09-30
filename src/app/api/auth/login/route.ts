import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/authService";
import { signToken, getAdminCookieName } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const admin = await AuthService.login(email, password);
    if (!admin) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = signToken(admin);
    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, email: admin.email },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: getAdminCookieName(),
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Authentication server error" },
      { status: 500 }
    );
  }
}
