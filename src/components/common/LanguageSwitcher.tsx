"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-full bg-emerald-50 p-1 border border-emerald-200 shadow-xs">
      <div className="flex items-center gap-1 px-1.5 text-emerald-800">
        <Globe className="w-3.5 h-3.5" />
      </div>
      <button
        type="button"
        onClick={() => setLocale("hi")}
        className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
          locale === "hi"
            ? "bg-emerald-700 text-white shadow-xs"
            : "text-emerald-900 hover:text-emerald-700"
        }`}
        aria-label="Switch to Hindi"
      >
        हिन्दी
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
          locale === "en"
            ? "bg-emerald-700 text-white shadow-xs"
            : "text-emerald-900 hover:text-emerald-700"
        }`}
        aria-label="Switch to English"
      >
        English
      </button>
    </div>
  );
}
