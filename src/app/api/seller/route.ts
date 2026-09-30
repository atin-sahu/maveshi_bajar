import { NextRequest, NextResponse } from "next/server";
import { SellerService } from "@/services/sellerService";
import { verifyAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const profile = await SellerService.getSellerProfile();
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Get seller profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch seller profile" },
      { status: 500 }
    );
  }
}

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

    const { imageUrl, publicId } = body || {};
    if (!imageUrl || !publicId) {
      return NextResponse.json(
        { error: "imageUrl and publicId are required" },
        { status: 400 }
      );
    }

    const updated = await SellerService.updateProfileImage(imageUrl, publicId);
    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    console.error("Update seller profile error:", error);
    return NextResponse.json(
      { error: "Failed to update seller profile image" },
      { status: 500 }
    );
  }
}
