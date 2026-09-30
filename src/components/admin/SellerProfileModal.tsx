"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { X, Upload, Loader2, CheckCircle2 } from "lucide-react";

interface SellerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage: string;
  onProfileUpdated: (newImageUrl: string) => void;
}

export function SellerProfileModal({
  isOpen,
  onClose,
  currentImage,
  onProfileUpdated,
}: SellerProfileModalProps) {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      // 1. Upload to Cloudinary under seller folder
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("mediaType", "seller");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.message || "Failed to upload image");
      }

      // 2. Save seller profile image in database
      const saveRes = await fetch("/api/seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploadData.asset.secure_url,
          publicId: uploadData.asset.public_id,
        }),
      });

      if (!saveRes.ok) {
        throw new Error("Failed to save seller profile");
      }

      setSuccess(true);
      onProfileUpdated(uploadData.asset.secure_url);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Update failed";
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-emerald-100 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-zinc-900 mb-4 text-center">
          {t("admin.changeSellerImage")}
        </h3>

        {error && (
          <div className="mb-4 p-2 text-xs text-red-600 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{t("toasts.sellerImageUpdated")}</span>
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-100 shadow-md">
            <Image
              src={previewUrl}
              alt="Seller profile"
              fill
              sizes="130px"
              className="object-cover"
            />
          </div>

          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors">
            <Upload className="w-4 h-4 text-emerald-700" />
            <span>फोटो चुनें (Select Photo)</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 w-full mt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-zinc-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs disabled:opacity-50 transition-all"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>{t("common.save")}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
