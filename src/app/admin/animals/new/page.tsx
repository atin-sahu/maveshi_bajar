"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { AnimalCategory, AnimalGender, APP_CONFIG } from "@/config/app";
import { ICloudinaryAsset } from "@/types";
import { ImageUploadPicker } from "@/components/admin/ImageUploadPicker";
import { VideoUploader } from "@/components/admin/VideoUploader";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

export default function AddAnimalPage() {
  const { t, locale } = useLanguage();
  const router = useRouter();

  const [category, setCategory] = useState<AnimalCategory>("cow");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState<string>("");
  const [biyat, setBiyat] = useState<string>("1");
  const [price, setPrice] = useState<string>("");
  const [gender, setGender] = useState<AnimalGender>("female");

  const [images, setImages] = useState<ICloudinaryAsset[]>([]);
  const [thumbnail, setThumbnail] = useState<ICloudinaryAsset | null>(null);
  const [video, setVideo] = useState<ICloudinaryAsset | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!breed.trim()) {
      setError(t("validation.fieldRequired"));
      return;
    }

    const numAge = Number(age);
    const numPrice = Number(price);
    const numBiyat = Number(biyat);

    if (isNaN(numAge) || numAge <= 0) {
      setError(t("validation.invalidAge"));
      return;
    }

    if (isNaN(numPrice) || numPrice <= 0) {
      setError(t("validation.invalidPrice"));
      return;
    }

    if (images.length < APP_CONFIG.MIN_IMAGES_PER_ANIMAL) {
      setError(
        t("validation.imageCountMin", { min: APP_CONFIG.MIN_IMAGES_PER_ANIMAL })
      );
      return;
    }

    if (!thumbnail) {
      setError(t("validation.thumbnailRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/animals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          breed: breed.trim(),
          age: numAge,
          biyat: numBiyat,
          price: numPrice,
          gender,
          images,
          thumbnail,
          video: video || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === "MAX_ANIMALS_REACHED") {
          throw new Error(
            locale === "hi"
              ? data.messageHi || t("validation.maxAnimalsExceeded", { max: APP_CONFIG.MAX_ANIMALS })
              : data.messageEn || t("validation.maxAnimalsExceeded", { max: APP_CONFIG.MAX_ANIMALS })
          );
        }
        throw new Error(data.message || data.error || "Failed to create animal");
      }

      router.push("/admin");
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Error saving animal";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6 animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("common.back")}</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-md space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900">
            {t("forms.addAnimalTitle")}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            अधिकतम 10 पशु सीमा में नया पशु जोड़ें।
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs sm:text-sm border border-red-200 flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                {t("animal.category")} *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const val = e.target.value as AnimalCategory;
                  setCategory(val);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-medium"
              >
                <option value="cow">गाय (Cow)</option>
                <option value="buffalo">भैंस (Buffalo)</option>
                <option value="buffalo_calf">पड़वा / पड़िया (Buffalo Calf)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                {t("animal.gender")} *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as AnimalGender)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-medium"
              >
                <option value="female">
                  {category === "buffalo_calf"
                    ? "पड़िया (मादा बछिया / Female Calf)"
                    : "मादा (Female)"}
                </option>
                <option value="male">
                  {category === "buffalo_calf"
                    ? "पड़वा (नर बछड़ा / Male Calf)"
                    : "नर (Male)"}
                </option>
              </select>
            </div>
          </div>

          {/* Breed */}
          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-1.5">
              {t("animal.breed")} *
            </label>
            <input
              type="text"
              required
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder={t("forms.breedPlaceholder")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Age, Biyat, Price Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                {t("animal.age")} ({t("animal.years")}) *
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="4"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                {t("animal.biyat")} ({t("animal.times")}) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={biyat}
                onChange={(e) => setBiyat(e.target.value)}
                placeholder="2"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                {t("animal.price")} (₹) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="85000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-bold"
              />
            </div>
          </div>

          {/* Image Upload Picker (1-5 photos, thumbnail selector) */}
          <div className="pt-2 border-t border-zinc-100">
            <ImageUploadPicker
              images={images}
              thumbnail={thumbnail}
              onChangeImages={setImages}
              onSelectThumbnail={setThumbnail}
            />
          </div>

          {/* Video Uploader (Optional, <= 20s) */}
          <div className="pt-2 border-t border-zinc-100">
            <VideoUploader video={video} onChangeVideo={setVideo} />
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
            <Link
              href="/admin"
              className="py-2.5 px-4 rounded-xl border border-zinc-200 text-zinc-700 text-xs sm:text-sm font-semibold hover:bg-zinc-50"
            >
              {t("common.cancel")}
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 active:scale-95 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>{t("forms.saveAnimal")}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
