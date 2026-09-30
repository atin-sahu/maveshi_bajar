import { NextResponse } from "next/server";
import { SellerService } from "@/services/sellerService";

export async function GET() {
  try {
    const contact = await SellerService.getSellerProfile();
    return NextResponse.json({ success: true, contact });
  } catch (error) {
    console.error("Get contact info error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact details" },
      { status: 500 }
    );
  }
}
