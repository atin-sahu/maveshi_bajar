"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  animalBreed?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  animalBreed,
}: DeleteConfirmModalProps) {
  const { t, locale } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 overflow-hidden relative animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon & Content */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-zinc-900 mb-2">
            {animalBreed
              ? locale === "hi"
                ? `क्या आप ${animalBreed} को हटाना चाहते हैं?`
                : `Are you sure you want to delete ${animalBreed}?`
              : t("deleteModal.title")}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed bg-red-50/60 p-3 rounded-xl border border-red-100 mb-6">
            {t("deleteModal.warning")}
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="py-2.5 px-4 rounded-xl border border-zinc-200 text-zinc-700 font-semibold text-sm hover:bg-zinc-50 active:scale-95 transition-all disabled:opacity-50"
            >
              {t("deleteModal.cancelBtn")}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isDeleting ? (
                <span>{t("deleteModal.deleting")}</span>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{t("deleteModal.confirmBtn")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
