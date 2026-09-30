/**
 * Pure client-safe Cloudinary URL optimization and direct upload helper
 * Does not import any Node.js dependencies (fs, http, etc.)
 */

export function getOptimizedImageUrl(
  urlOrPublicId: string,
  options?: { width?: number; height?: number; crop?: string }
): string {
  if (!urlOrPublicId) return "";
  if (urlOrPublicId.includes("res.cloudinary.com")) {
    const { width = 800, height, crop = "limit" } = options || {};
    const transforms = [`f_auto`, `q_auto`, `w_${width}`];
    if (height) transforms.push(`h_${height}`);
    if (crop) transforms.push(`c_${crop}`);
    const transformStr = transforms.join(",");

    // Inject transformation string after /upload/
    return urlOrPublicId.replace("/upload/", `/upload/${transformStr}/`);
  }
  return urlOrPublicId;
}

/**
 * Direct client-side upload to Cloudinary using unsigned upload preset
 * Bypasses serverless payload limits and uploads directly to Cloudinary
 */
export async function uploadDirectToCloudinary(
  file: File | Blob,
  resourceType: "image" | "video" = "image"
): Promise<{
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
  duration?: number;
  resource_type: "image" | "video";
}> {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "mdd0kut0";
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "helping_hands";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Cloudinary upload failed");
  }

  return {
    public_id: data.public_id,
    secure_url: data.secure_url,
    width: data.width,
    height: data.height,
    format: data.format,
    duration: data.duration,
    resource_type: resourceType,
  };
}
