import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { AuthService } from "@/services/authService";

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { currentPassword, newPassword } = body || {};

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both current and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await AuthService.changePassword(session.id, session.email, currentPassword, newPassword);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully in database",
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to change password";
    if (msg === "INVALID_CURRENT_PASSWORD") {
      return NextResponse.json(
        { error: "वर्तमान पासवर्ड गलत है (Incorrect current password)" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
