"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { AnimalCategory, AnimalGender, APP_CONFIG } from "@/config/app";
import { ICloudinaryAsset, IAnimal } from "@/types";
import { ImageUploadPicker } from "@/components/admin/ImageUploadPicker";
import { VideoUploader } from "@/components/admin/VideoUploader";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

interface EditAnimalPageProps {
  params: Promise<{ id: string }>;
}

export default function EditAnimalPage({ params }: EditAnimalPageProps) {
  const { id } = use(params);
  const { t } = useLanguage();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<AnimalCategory>("cow");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState<string>("");
  const [biyat, setBiyat] = useState<string>("0");
  const [price, setPrice] = useState<string>("");
  const [gender, setGender] = useState<AnimalGender>("female");

  const [images, setImages] = useState<ICloudinaryAsset[]>([]);
  const [thumbnail, setThumbnail] = useState<ICloudinaryAsset | null>(null);
  const [video, setVideo] = useState<ICloudinaryAsset | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnimal() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/animals/${id}`);
        if (!res.ok) throw new Error("Animal not found");
        const data = await res.json();
        const a: IAnimal = data.animal;

        setCategory(a.category);
        setBreed(a.breed);
        setAge(String(a.age));
        setBiyat(String(a.biyat));
        setPrice(String(a.price));
        setGender(a.gender);
        setImages(a.images || []);
        setThumbnail(a.thumbnail || a.images[0] || null);
        setVideo(a.video || null);
      } catch (err: unknown) {
        console.error(err);
        setError("Failed to load animal details");
      } finally {
        setIsLoading(false);
      }
    }

    loadAnimal();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      const res = await fetch(`/api/animals/${id}`, {
        method: "PUT",
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
        throw new Error(data.message || data.error || "Failed to update animal");
      }

      router.push("/admin");
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Error updating animal";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6 animate-in fade-in duration-200">
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
            {t("forms.editAnimalTitle")}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            पशु का विवरण व फोटो/वीडियो अपडेट करें।
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs sm:text-sm border border-red-200 flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                {t("animal.category")} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AnimalCategory)}
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

          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-1.5">
              {t("animal.breed")} *
            </label>
            <input
              type="text"
              required
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>

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
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-bold"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <ImageUploadPicker
              images={images}
              thumbnail={thumbnail}
              onChangeImages={setImages}
              onSelectThumbnail={setThumbnail}
            />
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <VideoUploader video={video} onChangeVideo={setVideo} />
          </div>

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
                <span>{t("forms.updateAnimal")}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
