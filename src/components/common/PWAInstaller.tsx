"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstaller() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.log("Service Worker registration failed:", err);
        });
      });
    }

    // Listen for PWA beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Check if user previously dismissed today
      const dismissedTime = localStorage.getItem("pwa_dismissed_time");
      if (!dismissedTime || Date.now() - Number(dismissedTime) > 86400000) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    localStorage.setItem("pwa_dismissed_time", String(Date.now()));
  };

  if (!showBanner || isDismissed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 max-w-sm mx-auto z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-emerald-900 text-white rounded-2xl p-3.5 shadow-2xl border border-emerald-700/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-xs text-white leading-tight">
              {t("common.appName")}
            </p>
            <p className="text-[11px] text-emerald-200">
              {t("common.installApp")} (1-Click)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-white text-emerald-950 text-xs font-bold rounded-lg shadow-xs hover:bg-emerald-50 active:scale-95 transition-all"
          >
            {t("common.installApp")}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 text-emerald-300 hover:text-white"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
