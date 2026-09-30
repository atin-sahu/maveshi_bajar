"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { AnimalCategory } from "@/config/app";

interface CategoryFilterProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  availableCategories: string[]; // only categories with existing animals
  totalCount: number;
}

export function CategoryFilter({
  activeCategory,
  onSelectCategory,
  availableCategories,
  totalCount,
}: CategoryFilterProps) {
  const { t } = useLanguage();

  // Define category items
  const categoryDefs: { key: string; labelHi: string; labelEn: string; emoji: string }[] = [
    { key: "all", labelHi: "सभी पशु", labelEn: "All Animals", emoji: "📋" },
    { key: "cow", labelHi: "गाय", labelEn: "Cow", emoji: "🐄" },
    { key: "buffalo", labelHi: "भैंस", labelEn: "Buffalo", emoji: "🐃" },
    { key: "buffalo_calf", labelHi: "पड़वा / पड़िया", labelEn: "Buffalo Calf", emoji: "🐾" },
  ];

  // Filter out categories that have no animals listed (always keep 'all' if totalCount > 0)
  const visibleCategories = categoryDefs.filter((cat) => {
    if (cat.key === "all") return true;
    return availableCategories.includes(cat.key);
  });

  if (visibleCategories.length <= 1) {
    return null; // Don't show filters if only 1 or no categories have animals
  }

  return (
    <div className="w-full my-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x touch-pan-x">
        {visibleCategories.map((cat) => {
          const isSelected = activeCategory === cat.key;
          const label = t === undefined ? cat.labelHi : (cat.key === "all" ? t("categories.all") : t(`categories.${cat.key}`));

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelectCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all snap-start shadow-xs ${
                isSelected
                  ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/25 scale-[1.02]"
                  : "bg-white text-zinc-700 border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
