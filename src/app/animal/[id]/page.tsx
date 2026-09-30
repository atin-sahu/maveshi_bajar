import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnimalService } from "@/services/animalService";
import { ImageGallery } from "@/components/animal/ImageGallery";
import { VideoPlayer } from "@/components/animal/VideoPlayer";
import { ContactButtons } from "@/components/common/ContactButtons";
import { SITE_CONFIG } from "@/config/site";
import { formatPrice } from "@/lib/utils";
import { getOptimizedImageUrl } from "@/lib/cloudinary-client";
import { ArrowLeft, Share2, ShieldCheck, CheckCircle2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const animal = await AnimalService.getAnimalById(id);

  if (!animal) {
    return {
      title: "पशु नहीं मिला | Maveshi Bajar",
    };
  }

  const categoryName =
    animal.category === "cow"
      ? "गाय"
      : animal.category === "buffalo"
      ? "भैंस"
      : animal.gender === "male"
      ? "पड़वा"
      : "पड़िया";

  const title = `${animal.breed} ${categoryName} बिक्री के लिए | ₹${formatPrice(animal.price)}`;
  const description = `उम्र: ${animal.age} वर्ष, ब्यांत: ${animal.biyat} बार। अच्छे और स्वस्थ पशु सीधे पशुपालक से खरीदें।`;
  const ogImageUrl = getOptimizedImageUrl(
    animal.thumbnail?.secure_url || animal.images[0]?.secure_url,
    { width: 1200, height: 630, crop: "fill" }
  );

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImageUrl ? [{ url: ogImageUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

export default async function AnimalDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const animal = await AnimalService.getAnimalById(id);

  if (!animal) {
    notFound();
  }

  const categoryHindi =
    animal.category === "cow"
      ? "गाय"
      : animal.category === "buffalo"
      ? "भैंस"
      : animal.gender === "male"
      ? "पड़वा (नर बछड़ा)"
      : "पड़िया (मादा बछिया)";

  const categoryEnglish =
    animal.category === "cow"
      ? "Cow"
      : animal.category === "buffalo"
      ? "Buffalo"
      : animal.gender === "male"
      ? "Male Buffalo Calf (पड़वा)"
      : "Female Buffalo Calf (पड़िया)";

  const posterUrl = getOptimizedImageUrl(
    animal.thumbnail?.secure_url || animal.images[0]?.secure_url,
    { width: 900, height: 506, crop: "fill" }
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Back navigation & Share */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-100 text-emerald-900 text-xs sm:text-sm font-semibold hover:bg-emerald-50 active:scale-95 transition-all shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>होम पर वापस जाएं (Back)</span>
        </Link>

        <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-full">
          {categoryHindi} • {categoryEnglish}
        </span>
      </div>

      {/* Main Image Gallery */}
      <section>
        <ImageGallery
          images={animal.images}
          thumbnail={animal.thumbnail}
          altText={`${animal.breed} ${categoryHindi}`}
        />
      </section>

      {/* Primary Details Card */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-100 shadow-sm space-y-6">
        {/* Title, Breed & Price */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-emerald-100/70">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                नस्ल (Breed)
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-zinc-500">
                {animal.gender === "male" ? "नर (Male)" : "मादा (Female)"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 leading-tight">
              {animal.breed}
            </h1>
          </div>

          <div className="sm:text-right">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
              कीमत (Price)
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-800">
              ₹{formatPrice(animal.price)}
            </span>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/60">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase block mb-0.5">
              उम्र (Age)
            </span>
            <span className="text-base sm:text-lg font-bold text-zinc-900">
              {animal.age} वर्ष (Years)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/60">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase block mb-0.5">
              ब्यांत (Biyat)
            </span>
            <span className="text-base sm:text-lg font-bold text-zinc-900">
              {animal.biyat} बार (times)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/60">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase block mb-0.5">
              श्रेणी (Category)
            </span>
            <span className="text-base sm:text-lg font-bold text-zinc-900">
              {categoryHindi}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100/60">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase block mb-0.5">
              लिंग (Gender)
            </span>
            <span className="text-base sm:text-lg font-bold text-zinc-900">
              {animal.gender === "male" ? "नर (Male)" : "मादा (Female)"}
            </span>
          </div>
        </div>

        {/* Seller Trust Badge */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-700">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold text-zinc-900">{SITE_CONFIG.SELLER_NAME}</p>
            <p className="text-[11px] text-zinc-500">{SITE_CONFIG.SELLER_ADDRESS}</p>
          </div>
        </div>

        {/* Contact Action Buttons */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold text-zinc-700 text-center">
            पशु के बारे में जानकारी लेने के लिए संपर्क करें:
          </p>
          <ContactButtons
            animalDetails={{
              breed: animal.breed,
              category: animal.category,
              price: animal.price,
            }}
          />
        </div>
      </section>

      {/* Video Player Section (Direct Cloudinary delivery) */}
      {animal.video?.secure_url && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-zinc-900">
              पशु का वीडियो (Animal Video)
            </h2>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              HD Video
            </span>
          </div>
          <VideoPlayer
            video={animal.video}
            posterUrl={posterUrl}
            animalTitle={`${animal.breed} ${categoryHindi}`}
          />
        </section>
      )}

      {/* Fixed Bottom Contact Bar for Mobile */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-emerald-100 p-3 sm:hidden z-30 shadow-lg">
        <ContactButtons
          compact={false}
          animalDetails={{
            breed: animal.breed,
            category: animal.category,
            price: animal.price,
          }}
        />
      </div>
    </div>
  );
}
