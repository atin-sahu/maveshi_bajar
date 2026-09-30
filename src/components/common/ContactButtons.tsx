"use client";

import React from "react";
import { SITE_CONFIG } from "@/config/site";
import { useLanguage } from "@/context/LanguageContext";
import { Phone, MessageCircle } from "lucide-react";

interface ContactButtonsProps {
  animalDetails?: {
    breed: string;
    category: string;
    price: number;
  };
  compact?: boolean;
}

export function ContactButtons({ animalDetails, compact = false }: ContactButtonsProps) {
  const { t, locale } = useLanguage();

  // Create customized WhatsApp message if on animal detail page
  let whatsappText = "";
  if (animalDetails) {
    const categoryName =
      animalDetails.category === "cow"
        ? locale === "hi" ? "गाय" : "Cow"
        : animalDetails.category === "buffalo"
        ? locale === "hi" ? "भैंस" : "Buffalo"
        : locale === "hi" ? "पड़वा/पड़िया" : "Buffalo Calf";

    whatsappText = t("animal.inquireAbout", {
      breed: animalDetails.breed,
      category: categoryName,
      price: animalDetails.price,
    });
  }

  const whatsappUrl = `https://wa.me/${SITE_CONFIG.SELLER_WHATSAPP}${
    whatsappText ? `?text=${encodeURIComponent(whatsappText)}` : ""
  }`;
  const phoneUrl = `tel:${SITE_CONFIG.SELLER_PHONE}`;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={phoneUrl}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          aria-label="Call Seller"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{t("common.call")}</span>
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          aria-label="WhatsApp Seller"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>{t("common.whatsapp")}</span>
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      <a
        href={phoneUrl}
        className="flex items-center justify-center gap-2.5 py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-emerald-700/20 transition-all text-center"
      >
        <Phone className="w-5 h-5 animate-pulse" />
        <span>{t("common.call")}</span>
      </a>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-xl shadow-md shadow-[#25D366]/20 transition-all text-center"
      >
        <MessageCircle className="w-5 h-5" />
        <span>{t("common.whatsapp")}</span>
      </a>
    </div>
  );
}
