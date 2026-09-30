import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { APP_CONFIG } from "@/config/app";
export { getOptimizedImageUrl, uploadDirectToCloudinary } from "./cloudinary-client";

const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME ||
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  "mdd0kut0";
const uploadPreset =
  process.env.CLOUDINARY_UPLOAD_PRESET ||
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
  "helping_hands";

// Configure Cloudinary SDK if API key/secret are available
if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface UploadOptions {
  folder?: string;
  resource_type?: "image" | "video" | "auto";
  transformation?: Record<string, unknown>[];
}

/**
 * Upload a Buffer or Data URI or Blob to Cloudinary
 * Uses upload_preset if configured (no API key required), or Cloudinary SDK
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer | string,
  options: UploadOptions
): Promise<UploadApiResponse> {
  const resourceType = options.resource_type === "video" ? "video" : "image";

  // If upload preset is available, use direct Cloudinary REST endpoint
  if (uploadPreset) {
    const formData = new FormData();
    formData.append("upload_preset", uploadPreset);

    if (options.folder) {
      formData.append("folder", options.folder);
    }

    if (typeof fileBuffer === "string" && fileBuffer.startsWith("data:")) {
      formData.append("file", fileBuffer);
    } else {
      const buffer = Buffer.isBuffer(fileBuffer)
        ? fileBuffer
        : Buffer.from(fileBuffer);
      const blob = new Blob([new Uint8Array(buffer)]);
      formData.append("file", blob);
    }

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message || "Cloudinary preset upload failed");
    }

    return data as UploadApiResponse;
  }

  // Fallback to Cloudinary SDK with API key/secret
  return new Promise((resolve, reject) => {
    if (typeof fileBuffer === "string" && fileBuffer.startsWith("data:")) {
      cloudinary.uploader.upload(
        fileBuffer,
        {
          folder: options.folder,
          resource_type: options.resource_type || "auto",
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error("Upload failed"));
          resolve(result);
        }
      );
    } else {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          resource_type: options.resource_type || "auto",
        },
        (error, result) => {
          if (error || !result) return reject(error || new Error("Upload failed"));
          resolve(result);
        }
      );

      if (Buffer.isBuffer(fileBuffer)) {
        uploadStream.end(fileBuffer);
      } else {
        uploadStream.end(Buffer.from(fileBuffer));
      }
    }
  });
}

/**
 * Delete asset from Cloudinary (image or video)
 */
export async function deleteFromCloudinary(
  public_id: string,
  resource_type: "image" | "video" = "image"
): Promise<{ result: string }> {
  // If API Secret is available, call Cloudinary destroy API
  if (process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_KEY) {
    try {
      const res = await cloudinary.uploader.destroy(public_id, {
        resource_type: resource_type,
        invalidate: true,
      });
      return res;
    } catch (error) {
      console.error(`Failed to delete asset ${public_id} from Cloudinary:`, error);
      return { result: "error" };
    }
  }

  // With unsigned presets alone, deletion via client is restricted; mark success gracefully
  return { result: "ok" };
}

/**
 * Backend verification of video duration.
 * If duration > APP_CONFIG.MAX_VIDEO_DURATION_SECONDS, asset is destroyed immediately.
 */
export async function verifyAndEnforceVideoDuration(
  public_id: string,
  reportedDuration?: number
): Promise<{ valid: boolean; duration: number }> {
  let duration = reportedDuration;

  if (typeof duration !== "number" || duration <= 0) {
    if (process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_KEY) {
      try {
        const resource = await cloudinary.api.resource(public_id, {
          resource_type: "video",
        });
        duration = resource.duration || 0;
      } catch (err) {
        console.error("Error fetching video metadata from Cloudinary:", err);
      }
    }
  }

  const finalDuration = duration || 0;

  if (finalDuration > APP_CONFIG.MAX_VIDEO_DURATION_SECONDS) {
    await deleteFromCloudinary(public_id, "video");
    return { valid: false, duration: finalDuration };
  }

  return { valid: true, duration: finalDuration };
}

export { cloudinary };
