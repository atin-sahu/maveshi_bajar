"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ICloudinaryAsset } from "@/types";
import { APP_CONFIG } from "@/config/app";
import { useLanguage } from "@/context/LanguageContext";
import { Upload, X, Star, CheckCircle2, Loader2, ImagePlus } from "lucide-react";

interface ImageUploadPickerProps {
  images: ICloudinaryAsset[];
  thumbnail: ICloudinaryAsset | null;
  onChangeImages: (images: ICloudinaryAsset[]) => void;
  onSelectThumbnail: (thumbnail: ICloudinaryAsset) => void;
}

export function ImageUploadPicker({
  images,
  thumbnail,
  onChangeImages,
  onSelectThumbnail,
}: ImageUploadPickerProps) {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);

    // Check count limit
    const currentCount = images.length;
    const incomingCount = files.length;
    if (currentCount + incomingCount > APP_CONFIG.MAX_IMAGES_PER_ANIMAL) {
      setUploadError(
        t("validation.imageCountMax", { max: APP_CONFIG.MAX_IMAGES_PER_ANIMAL })
      );
      return;
    }

    setIsUploading(true);

    try {
      const newAssets: ICloudinaryAsset[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("mediaType", "image");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || data.error || "Upload failed");
        }

        newAssets.push(data.asset);
      }

      const updatedImages = [...images, ...newAssets];
      onChangeImages(updatedImages);

      // If no thumbnail yet, set first image as thumbnail
      if (!thumbnail && updatedImages.length > 0) {
        onSelectThumbnail(updatedImages[0]);
      }
    } catch (err: unknown) {
      console.error("Image upload failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setUploadError(msg);
    } finally {
      setIsUploading(false);
      // Reset input value so same files can be re-selected if needed
      e.target.value = "";
    }
  };

  const handleRemoveImage = async (indexToRemove: number) => {
    const removedImg = images[indexToRemove];
    const updated = images.filter((_, i) => i !== indexToRemove);
    onChangeImages(updated);

    // If removed image was thumbnail, designate new thumbnail
    if (thumbnail?.public_id === removedImg.public_id) {
      if (updated.length > 0) {
        onSelectThumbnail(updated[0]);
      } else {
        // @ts-expect-error Resetting thumbnail when no images remain
        onSelectThumbnail(null);
      }
    }

    // Call API to remove from Cloudinary
    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: removedImg.public_id,
          resource_type: "image",
        }),
      });
    } catch (err) {
      console.error("Failed to delete Cloudinary asset:", err);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs sm:text-sm font-bold text-zinc-900">
            {t("forms.photosLabel")} *
          </label>
          <p className="text-[11px] text-zinc-500">{t("forms.photosHint")}</p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
          {images.length} / {APP_CONFIG.MAX_IMAGES_PER_ANIMAL}
        </span>
      </div>

      {uploadError && (
        <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
          {uploadError}
        </div>
      )}

      {/* Grid of uploaded images */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {images.map((img, idx) => {
          const isSelectedThumbnail = thumbnail?.public_id === img.public_id;

          return (
            <div
              key={img.public_id || idx}
              className={`relative aspect-square rounded-xl overflow-hidden bg-zinc-100 border-2 transition-all group ${
                isSelectedThumbnail
                  ? "border-emerald-600 ring-2 ring-emerald-500/20"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <Image
                src={img.secure_url}
                alt={`Animal photo ${idx + 1}`}
                fill
                sizes="150px"
                className="object-cover"
              />

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors"
                title={t("forms.remove")}
                aria-label="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Thumbnail Selector / Badge */}
              <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                {isSelectedThumbnail ? (
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 rounded py-0.5 px-1.5">
                    <Star className="w-3 h-3 fill-emerald-400" />
                    <span>{t("forms.isThumbnail")}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectThumbnail(img)}
                    className="w-full text-center text-[10px] text-white hover:text-emerald-300 bg-white/20 hover:bg-black/60 rounded py-0.5 px-1 font-medium transition-colors"
                  >
                    {t("forms.markAsThumbnail")}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Upload Trigger Button if under MAX limit */}
        {images.length < APP_CONFIG.MAX_IMAGES_PER_ANIMAL && (
          <label
            className={`relative aspect-square rounded-xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
              isUploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            ) : (
              <>
                <ImagePlus className="w-6 h-6 text-emerald-600" />
                <span className="text-[11px] font-semibold text-emerald-800 text-center px-2">
                  + {t("forms.photosLabel").split("(")[0]}
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="sr-only"
              disabled={isUploading}
            />
          </label>
        )}
      </div>
    </div>
  );
}
