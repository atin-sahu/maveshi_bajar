"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { IAnimal } from "@/types";
import { AnimalCard } from "@/components/animal/AnimalCard";
import { CategoryFilter } from "@/components/animal/CategoryFilter";
import { SITE_CONFIG } from "@/config/site";
import { Phone, MessageCircle, Sparkles, AlertCircle, Loader2 } from "lucide-react";

export default function HomePage() {
  const { t } = useLanguage();
  const [animals, setAnimals] = useState<IAnimal[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnimals() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/animals");
        if (!res.ok) throw new Error("Failed to load animals");
        const data = await res.json();
        setAnimals(data.animals || []);
      } catch (err: unknown) {
        console.error(err);
        setError("Could not load animals. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnimals();
  }, []);

  // Determine available categories that have at least one animal
  const availableCategories = Array.from(new Set(animals.map((a) => a.category)));

  // Filter animals by active category
  const filteredAnimals = animals.filter((animal) => {
    if (activeCategory === "all") return true;
    return animal.category === activeCategory;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-6 sm:p-10 shadow-xl border border-emerald-700/50">
        {/* Subtle decorative background pattern */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t("hero.directContact")}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            {t("hero.title")}
          </h1>

          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-xl">
            {t("hero.subtitle")}
          </p>

          {/* Quick Contact Buttons on Hero */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={`tel:${SITE_CONFIG.SELLER_PHONE}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-950 font-bold text-xs sm:text-sm rounded-xl shadow-md hover:bg-emerald-50 active:scale-95 transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-700" />
              <span>{t("common.call")}</span>
            </a>

            <a
              href={`https://wa.me/${SITE_CONFIG.SELLER_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:bg-[#20ba59] active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{t("common.whatsapp")}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Category Horizontal Filter (Only shows categories with animals) */}
      <CategoryFilter
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        availableCategories={availableCategories}
        totalCount={animals.length}
      />

      {/* Animals Listing */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
            <span>{t("hero.viewAnimals")}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {filteredAnimals.length}
            </span>
          </h2>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-xs font-medium">{t("common.loading")}</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredAnimals.length === 0 && (
          <div className="py-16 px-4 bg-white rounded-3xl border border-dashed border-emerald-200 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-3xl">
              🐄
            </div>
            <h3 className="font-bold text-base text-zinc-800">
              {t("animal.noAnimalsFound")}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {t("contact.pageSubtitle")}
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-800 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t("contact.callSeller")}</span>
              </Link>
            </div>
          </div>
        )}

        {/* Animals Grid (Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns) */}
        {!isLoading && !error && filteredAnimals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAnimals.map((animal) => (
              <AnimalCard key={animal._id} animal={animal} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
