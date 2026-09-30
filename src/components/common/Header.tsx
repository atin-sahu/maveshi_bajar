"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Phone, Menu, X, Shield, Sparkles } from "lucide-react";

export function Header() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">🐄</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-emerald-950 tracking-tight leading-none">
                  {t("common.appName")}
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-md">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium leading-tight">
                {t("hero.directContact")}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-5 text-sm font-medium">
              <Link
                href="/"
                className={`transition-colors ${
                  isActive("/")
                    ? "text-emerald-700 font-semibold"
                    : "text-zinc-600 hover:text-emerald-700"
                }`}
              >
                {t("common.home")}
              </Link>
              <Link
                href="/contact"
                className={`transition-colors flex items-center gap-1.5 ${
                  isActive("/contact")
                    ? "text-emerald-700 font-semibold"
                    : "text-zinc-600 hover:text-emerald-700"
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                {t("common.contact")}
              </Link>
              <Link
                href="/admin"
                className={`transition-colors flex items-center gap-1 ${
                  isActive("/admin")
                    ? "text-emerald-700 font-semibold"
                    : "text-zinc-500 hover:text-emerald-700"
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-zinc-400" />
                {t("common.admin")}
              </Link>
            </nav>

            <LanguageSwitcher />
          </div>

          {/* Mobile Right: Language Switcher + Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-emerald-900 hover:bg-emerald-50 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-100 bg-white px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
              isActive("/") ? "bg-emerald-50 text-emerald-800" : "text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            {t("common.home")}
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
              isActive("/contact") ? "bg-emerald-50 text-emerald-800" : "text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            <Phone className="w-4 h-4 text-emerald-600" />
            {t("common.contact")}
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
              isActive("/admin") ? "bg-emerald-50 text-emerald-800" : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            <Shield className="w-4 h-4 text-zinc-400" />
            {t("common.admin")}
          </Link>
        </div>
      )}
    </header>
  );
}
