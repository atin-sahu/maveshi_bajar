"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { SITE_CONFIG } from "@/config/site";
import { Phone, MessageCircle, Shield } from "lucide-react";

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-emerald-950 text-emerald-100 border-t border-emerald-900 mt-16 pb-20 md:pb-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand & Mission */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🐄</span>
              <span className="font-bold text-lg text-white">
                {t("common.appName")}
              </span>
            </div>
            <p className="text-xs text-emerald-300 leading-relaxed max-w-xs">
              {t("hero.subtitle")}
            </p>
          </div>

          {/* Direct Contact Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              {t("contact.pageTitle")}
            </h4>
            <p className="text-sm font-medium text-white">{SITE_CONFIG.SELLER_NAME}</p>
            <div className="flex flex-col gap-1.5 text-xs text-emerald-300">
              <a
                href={`tel:${SITE_CONFIG.SELLER_PHONE}`}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                {SITE_CONFIG.SELLER_PHONE}
              </a>
              <a
                href={`https://wa.me/${SITE_CONFIG.SELLER_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                {SITE_CONFIG.SELLER_WHATSAPP}
              </a>
            </div>
          </div>

          {/* Quick Links & Admin */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              {t("common.appName")}
            </h4>
            <div className="flex flex-col gap-1 text-xs text-emerald-300">
              <Link href="/" className="hover:text-white transition-colors">
                {t("common.home")}
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                {t("common.contact")}
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-1 text-emerald-400 hover:text-white transition-colors pt-2"
              >
                <Shield className="w-3 h-3" />
                {t("common.admin")}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-400 gap-2">
          <p>© {currentYear} {t("common.appName")}. {t("common.allRightsReserved")}.</p>
          <p className="text-[11px] text-emerald-500">
            PWA Mobile-First Architecture
          </p>
        </div>
      </div>
    </footer>
  );
}
