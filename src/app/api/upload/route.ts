import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { APP_CONFIG } from "@/config/app";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  verifyAndEnforceVideoDuration,
} from "@/lib/cloudinary-server";

export const maxDuration = 60; // Allow sufficient time for Cloudinary upload processing

export async function POST(req: NextRequest) {
  try {
    // 1. Ensure admin authentication
    const session = await verifyAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mediaType = (formData.get("mediaType") as string) || "image"; // "image" | "video" | "seller"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine target folder and resource type
    let folder: string = APP_CONFIG.CLOUDINARY_FOLDERS.IMAGES;
    let resource_type: "image" | "video" = "image";

    if (mediaType === "video" || file.type.startsWith("video/")) {
      folder = APP_CONFIG.CLOUDINARY_FOLDERS.VIDEOS;
      resource_type = "video";
    } else if (mediaType === "seller") {
      folder = APP_CONFIG.CLOUDINARY_FOLDERS.SELLER;
      resource_type = "image";
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(buffer, {
      folder,
      resource_type,
    });

    // If media is a video, validate actual duration
    if (resource_type === "video") {
      const durationValidation = await verifyAndEnforceVideoDuration(
        uploadResult.public_id,
        uploadResult.duration
      );

      if (!durationValidation.valid) {
        // Asset has already been deleted in Cloudinary by verifyAndEnforceVideoDuration
        return NextResponse.json(
          {
            error: "VIDEO_DURATION_EXCEEDED",
            message: `Video duration (${Math.round(durationValidation.duration)}s) exceeds maximum allowed limit of ${APP_CONFIG.MAX_VIDEO_DURATION_SECONDS} seconds.`,
            messageHi: `वीडियो ${APP_CONFIG.MAX_VIDEO_DURATION_SECONDS} सेकंड से अधिक नहीं होना चाहिए।`,
            messageEn: `Video cannot be longer than ${APP_CONFIG.MAX_VIDEO_DURATION_SECONDS} seconds.`,
            maxDuration: APP_CONFIG.MAX_VIDEO_DURATION_SECONDS,
            actualDuration: durationValidation.duration,
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      asset: {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        duration: uploadResult.duration,
        resource_type,
      },
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload asset";
    return NextResponse.json(
      { error: "UPLOAD_FAILED", message: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await verifyAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { public_id, resource_type = "image" } = await req.json();
    if (!public_id) {
      return NextResponse.json({ error: "public_id is required" }, { status: 400 });
    }

    const result = await deleteFromCloudinary(public_id, resource_type);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Delete asset error:", error);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}
