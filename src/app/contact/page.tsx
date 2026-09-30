"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { SITE_CONFIG } from "@/config/site";
import { ContactButtons } from "@/components/common/ContactButtons";
import { Phone, MessageCircle, MapPin, Award, Clock, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState({
    sellerName: SITE_CONFIG.SELLER_NAME,
    sellerPhone: SITE_CONFIG.SELLER_PHONE,
    sellerWhatsapp: SITE_CONFIG.SELLER_WHATSAPP,
    sellerProfileImage: SITE_CONFIG.SELLER_PROFILE_IMAGE,
    sellerAddress: SITE_CONFIG.SELLER_ADDRESS,
    sellerExperience: SITE_CONFIG.SELLER_EXPERIENCE,
  });

  useEffect(() => {
    // Fetch latest dynamic profile if updated by admin
    fetch("/api/contact")
      .then((res) => res.json())
      .then((data) => {
        if (data.contact) {
          setProfile(data.contact);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
          {t("contact.pageTitle")}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
          {t("contact.pageSubtitle")}
        </p>
      </div>

      {/* Main Seller Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-md space-y-6">
        {/* Profile Image & Name */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-emerald-500/20 shadow-lg bg-emerald-50">
            <Image
              src={profile.sellerProfileImage || SITE_CONFIG.SELLER_PROFILE_IMAGE}
              alt={profile.sellerName}
              fill
              sizes="130px"
              priority
              className="object-cover"
            />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900">
              {profile.sellerName}
            </h2>
            <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>प्रमाणित पशुपालक (Verified Seller)</span>
            </div>
          </div>
        </div>

        {/* Detailed Information List */}
        <div className="space-y-3 pt-2">
          {/* Phone */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                {t("contact.phone")}
              </p>
              <a
                href={`tel:${profile.sellerPhone}`}
                className="text-sm sm:text-base font-bold text-zinc-900 hover:text-emerald-700 transition-colors"
              >
                {profile.sellerPhone}
              </a>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                {t("contact.whatsapp")}
              </p>
              <a
                href={`https://wa.me/${profile.sellerWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm sm:text-base font-bold text-zinc-900 hover:text-emerald-700 transition-colors"
              >
                +{profile.sellerWhatsapp}
              </a>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                {t("contact.address")}
              </p>
              <p className="text-sm font-semibold text-zinc-800">
                {profile.sellerAddress}
              </p>
            </div>
          </div>

          {/* Experience */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                {t("contact.experience")}
              </p>
              <p className="text-sm font-semibold text-zinc-800">
                {profile.sellerExperience}
              </p>
            </div>
          </div>
        </div>

        {/* Big Action Buttons */}
        <div className="pt-2">
          <ContactButtons />
        </div>

        <p className="text-center text-[11px] text-zinc-400">
          🕒 {t("contact.workingHours")}
        </p>
      </div>
    </div>
  );
}
