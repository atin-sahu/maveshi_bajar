"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { IAnimal } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice } from "@/lib/utils";
import { getOptimizedImageUrl } from "@/lib/cloudinary-client";
import { Video, ArrowRight, Sparkles } from "lucide-react";

interface AnimalCardProps {
  animal: IAnimal;
}

export function AnimalCard({ animal }: AnimalCardProps) {
  const { t, locale } = useLanguage();

  // Determine category & gender display
  let categoryLabel = "";
  if (animal.category === "cow") {
    categoryLabel = locale === "hi" ? "गाय" : "Cow";
  } else if (animal.category === "buffalo") {
    categoryLabel = locale === "hi" ? "भैंस" : "Buffalo";
  } else if (animal.category === "buffalo_calf") {
    if (animal.gender === "male") {
      categoryLabel = locale === "hi" ? "पड़वा (नर बछड़ा)" : "Male Buffalo Calf (पड़वा)";
    } else {
      categoryLabel = locale === "hi" ? "पड़िया (मादा बछिया)" : "Female Buffalo Calf (पड़िया)";
    }
  }

  const thumbnailUrl =
    getOptimizedImageUrl(animal.thumbnail?.secure_url || animal.images[0]?.secure_url, {
      width: 600,
      height: 450,
      crop: "fill",
    }) || "/placeholder.jpg";

  return (
    <div className="group bg-white rounded-2xl border border-emerald-100/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col">
      {/* Thumbnail with badges */}
      <Link href={`/animal/${animal._id}`} className="relative aspect-4/3 overflow-hidden bg-zinc-100 block">
        <Image
          src={thumbnailUrl}
          alt={`${animal.breed} ${categoryLabel}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          priority={false}
        />
        
        {/* Category & Gender Pill */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-3 py-1 bg-emerald-900/85 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-sm">
            {categoryLabel}
          </span>
          {animal.category !== "buffalo_calf" && (
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-emerald-950 text-xs font-semibold rounded-full shadow-sm">
              {animal.gender === "male"
                ? locale === "hi" ? "नर" : "Male"
                : locale === "hi" ? "मादा" : "Female"}
            </span>
          )}
        </div>

        {/* Video Available Badge */}
        {animal.video?.secure_url && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/95 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-sm animate-pulse">
            <Video className="w-3.5 h-3.5" />
            <span className="text-[11px]">{t("common.videoAvailable")}</span>
          </div>
        )}

        {/* Photos count pill */}
        {animal.images?.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[11px] rounded-md font-medium">
            📷 {animal.images.length}
          </div>
        )}
      </Link>

      {/* Animal Information Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Breed & Price Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700">
                {t("animal.breed")}
              </p>
              <h3 className="font-extrabold text-lg sm:text-xl text-zinc-900 leading-tight">
                {animal.breed}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700">
                {t("animal.price")}
              </p>
              <p className="font-black text-lg sm:text-xl text-emerald-800">
                ₹{formatPrice(animal.price)}
              </p>
            </div>
          </div>

          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 gap-2 py-2.5 px-3 bg-emerald-50/60 rounded-xl text-xs mb-4">
            <div>
              <span className="text-zinc-500 block text-[11px]">
                {t("animal.age")}:
              </span>
              <span className="font-bold text-zinc-800">
                {animal.age} {t("animal.years")}
              </span>
            </div>

            <div>
              <span className="text-zinc-500 block text-[11px]">
                {t("animal.biyat")}:
              </span>
              <span className="font-bold text-zinc-800">
                {animal.biyat} {t("animal.times")}
              </span>
            </div>
          </div>
        </div>

        {/* View Details Action Button */}
        <Link
          href={`/animal/${animal._id}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all group/btn"
        >
          <span>{t("common.viewDetails")}</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
