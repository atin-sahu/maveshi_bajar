"use client";

import React, { useState } from "react";
import { ICloudinaryAsset } from "@/types";
import { APP_CONFIG } from "@/config/app";
import { useLanguage } from "@/context/LanguageContext";
import { Video, X, Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface VideoUploaderProps {
  video: ICloudinaryAsset | null;
  onChangeVideo: (video: ICloudinaryAsset | null) => void;
}

export function VideoUploader({ video, onChangeVideo }: VideoUploaderProps) {
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // 1. Client-side duration pre-check using HTML5 Video element
    const objectUrl = URL.createObjectURL(file);
    const tempVideo = document.createElement("video");
    tempVideo.preload = "metadata";
    tempVideo.src = objectUrl;

    const checkDuration = new Promise<number>((resolve, reject) => {
      tempVideo.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(tempVideo.duration);
      };
      tempVideo.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to read video file"));
      };
    });

    try {
      const clientDuration = await checkDuration;
      if (clientDuration > APP_CONFIG.MAX_VIDEO_DURATION_SECONDS) {
        setError(
          t("validation.videoDurationExceeded", {
            max: APP_CONFIG.MAX_VIDEO_DURATION_SECONDS,
          })
        );
        e.target.value = "";
        return;
      }
    } catch {
      // Proceed to server validation if browser metadata fails
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mediaType", "video");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === "VIDEO_DURATION_EXCEEDED") {
          throw new Error(
            t("validation.videoDurationExceeded", {
              max: APP_CONFIG.MAX_VIDEO_DURATION_SECONDS,
            })
          );
        }
        throw new Error(data.message || data.error || "Failed to upload video");
      }

      onChangeVideo(data.asset);
    } catch (err: unknown) {
      console.error("Video upload error:", err);
      const msg = err instanceof Error ? err.message : "Video upload failed";
      setError(msg);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveVideo = async () => {
    if (!video) return;
    const publicId = video.public_id;
    onChangeVideo(null);

    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: publicId,
          resource_type: "video",
        }),
      });
    } catch (err) {
      console.error("Failed to delete video:", err);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs sm:text-sm font-bold text-zinc-900">
          {t("forms.videoLabel")}
        </label>
        <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
          {t("forms.videoHint", { max: APP_CONFIG.MAX_VIDEO_DURATION_SECONDS })}
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {video ? (
        <div className="p-3 bg-zinc-900 text-white rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                {t("common.videoAvailable")}
              </p>
              <p className="text-[11px] text-zinc-400">
                {video.duration ? `${Math.round(video.duration)}s • ` : ""}
                {video.format?.toUpperCase() || "MP4"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemoveVideo}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-red-600 text-zinc-300 hover:text-white transition-colors"
            title={t("forms.remove")}
            aria-label="Remove video"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          className={`flex items-center justify-center gap-2 py-4 px-4 rounded-xl border-2 border-dashed border-zinc-300 hover:border-emerald-500 bg-zinc-50 hover:bg-emerald-50/30 cursor-pointer transition-all ${
            isUploading ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
          ) : (
            <Video className="w-5 h-5 text-zinc-600" />
          )}
          <span className="text-xs font-semibold text-zinc-700">
            {isUploading ? t("forms.uploading") : t("forms.videoLabel")}
          </span>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoFileChange}
            className="sr-only"
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
}
