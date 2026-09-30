"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ICloudinaryAsset } from "@/types";
import { getOptimizedImageUrl } from "@/lib/cloudinary-client";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface ImageGalleryProps {
  images: ICloudinaryAsset[];
  thumbnail: ICloudinaryAsset;
  altText: string;
}

export function ImageGallery({ images, thumbnail, altText }: ImageGalleryProps) {
  // Ensure the thumbnail is first or default
  const allImages = images && images.length > 0 ? images : [thumbnail];
  const initialIndex = allImages.findIndex(
    (img) => img.public_id === thumbnail?.public_id
  );
  const [selectedIndex, setSelectedIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const currentImage = allImages[selectedIndex] || thumbnail;

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Mobile swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // Minimum swipe threshold 40px
    if (diff > 40) {
      nextImage();
    } else if (diff < -40) {
      prevImage();
    }
    setTouchStart(null);
  };

  const mainImageUrl = getOptimizedImageUrl(currentImage.secure_url, {
    width: 1000,
    height: 750,
    crop: "fill",
  });

  return (
    <div className="space-y-3">
      {/* Main Preview Container with Swipe Support */}
      <div
        className="relative aspect-4/3 rounded-2xl overflow-hidden bg-zinc-900 border border-emerald-100 shadow-md touch-pan-y select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={mainImageUrl}
          alt={`${altText} - photo ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 700px"
          className="object-cover transition-opacity duration-300"
        />

        {/* Counter Badge */}
        <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/65 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-sm">
          {selectedIndex + 1} / {allImages.length}
        </div>

        {/* Left / Right Chevron arrows if > 1 photo */}
        {allImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xs text-white flex items-center justify-center transition-all active:scale-95"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-xs text-white flex items-center justify-center transition-all active:scale-95"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Row (if multiple images) */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
          {allImages.map((img, idx) => {
            const thumbUrl = getOptimizedImageUrl(img.secure_url, {
              width: 160,
              height: 120,
              crop: "fill",
            });
            const isActive = idx === selectedIndex;
            return (
              <button
                key={img.public_id || idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all snap-start ${
                  isActive
                    ? "border-emerald-600 ring-2 ring-emerald-500/30 scale-95"
                    : "border-transparent opacity-75 hover:opacity-100"
                }`}
                aria-label={`Select photo ${idx + 1}`}
              >
                <Image
                  src={thumbUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
