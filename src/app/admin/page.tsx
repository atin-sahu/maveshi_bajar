"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { IAnimal } from "@/types";
import { APP_CONFIG } from "@/config/app";
import { SITE_CONFIG } from "@/config/site";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";
import { SellerProfileModal } from "@/components/admin/SellerProfileModal";
import { ChangePasswordModal } from "@/components/admin/ChangePasswordModal";
import { formatPrice } from "@/lib/utils";
import { getOptimizedImageUrl } from "@/lib/cloudinary-client";
import {
  Plus,
  Edit,
  Trash2,
  Video,
  LogOut,
  Camera,
  Key,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { t, locale } = useLanguage();
  const router = useRouter();

  const [animals, setAnimals] = useState<IAnimal[]>([]);
  const [sellerImage, setSellerImage] = useState<string>(SITE_CONFIG.SELLER_PROFILE_IMAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState<IAnimal | null>(null);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Verify session
      const meRes = await fetch("/api/auth/me");
      if (!meRes.ok) {
        router.push("/admin/login");
        return;
      }

      // Fetch animals
      const animalsRes = await fetch("/api/animals");
      const animalsData = await animalsRes.json();
      setAnimals(animalsData.animals || []);

      // Fetch seller profile
      const sellerRes = await fetch("/api/seller");
      const sellerData = await sellerRes.json();
      if (sellerData.profile?.sellerProfileImage) {
        setSellerImage(sellerData.profile.sellerProfileImage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!animalToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/animals/${animalToDelete._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete animal");
      }

      setAnimals((prev) => prev.filter((a) => a._id !== animalToDelete._id));
      setToastMessage(t("toasts.animalDeleted"));
      setAnimalToDelete(null);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete animal. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isMaxReached = animals.length >= APP_CONFIG.MAX_ANIMALS;

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-zinc-500">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 p-4 bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-xl border border-emerald-700 flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900">
            {t("admin.dashboardTitle")}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            अधिकतम 10 पशु प्रबंधन • Cloudinary & MongoDB
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-2xl font-black text-sm sm:text-base border ${
              isMaxReached
                ? "bg-amber-50 text-amber-900 border-amber-200"
                : "bg-emerald-50 text-emerald-900 border-emerald-200"
            }`}
          >
            {t("admin.animalsListedCount", {
              current: animals.length,
              max: APP_CONFIG.MAX_ANIMALS,
            })}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            title={t("common.logout")}
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Bar: Add Animal + Seller Profile Image */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isMaxReached ? (
            <div className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-zinc-100 text-zinc-400 font-bold text-xs rounded-xl cursor-not-allowed">
              <Plus className="w-4 h-4" />
              <span>{t("admin.maxLimitReached", { max: APP_CONFIG.MAX_ANIMALS })}</span>
            </div>
          ) : (
            <Link
              href="/admin/animals/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t("admin.addNewAnimal")}</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsSellerModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-zinc-200 hover:border-emerald-300 text-zinc-800 font-semibold text-xs sm:text-sm rounded-xl shadow-2xs transition-colors"
          >
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>{t("admin.changeSellerImage")}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-zinc-200 hover:border-emerald-300 text-zinc-800 font-semibold text-xs sm:text-sm rounded-xl shadow-2xs transition-colors"
          >
            <Key className="w-4 h-4 text-emerald-600" />
            <span>पासवर्ड बदलें (Change Password)</span>
          </button>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
        >
          <span>वेबसाइट देखें (View Site)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Animal List Table / Cards */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        {animals.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-2xl flex items-center justify-center">
              🐄
            </div>
            <p className="text-sm font-bold text-zinc-800">
              कोई पशु सूचीबद्ध नहीं है (No animals listed)
            </p>
            <p className="text-xs text-zinc-500">
              ऊपर दिए गए &quot;{t("admin.addNewAnimal")}&quot; बटन से पहला पशु जोड़ें।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-emerald-50/70 border-b border-emerald-100 text-emerald-950 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 sm:p-4">{t("admin.tableThumbnail")}</th>
                  <th className="p-3 sm:p-4">{t("admin.tableBreed")}</th>
                  <th className="p-3 sm:p-4">{t("admin.tableCategory")}</th>
                  <th className="p-3 sm:p-4">{t("admin.tableAge")} / {t("admin.tableBiyat")}</th>
                  <th className="p-3 sm:p-4">{t("admin.tablePrice")}</th>
                  <th className="p-3 sm:p-4">{t("admin.tableVideo")}</th>
                  <th className="p-3 sm:p-4 text-right">{t("admin.tableActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {animals.map((animal) => {
                  const thumbUrl = getOptimizedImageUrl(
                    animal.thumbnail?.secure_url || animal.images[0]?.secure_url,
                    { width: 120, height: 90, crop: "fill" }
                  );

                  const catDisplay =
                    animal.category === "cow"
                      ? "गाय (Cow)"
                      : animal.category === "buffalo"
                      ? "भैंस (Buffalo)"
                      : animal.gender === "male"
                      ? "पड़वा (Calf M)"
                      : "पड़िया (Calf F)";

                  return (
                    <tr key={animal._id} className="hover:bg-zinc-50/70 transition-colors">
                      {/* Thumbnail */}
                      <td className="p-3 sm:p-4">
                        <div className="relative w-14 h-11 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200">
                          <Image
                            src={thumbUrl}
                            alt={animal.breed}
                            fill
                            sizes="60px"
                            className="object-cover"
                          />
                        </div>
                      </td>

                      {/* Breed */}
                      <td className="p-3 sm:p-4 font-bold text-zinc-900">
                        {animal.breed}
                      </td>

                      {/* Category */}
                      <td className="p-3 sm:p-4 text-zinc-700">
                        {catDisplay}
                      </td>

                      {/* Age / Biyat */}
                      <td className="p-3 sm:p-4 text-zinc-600">
                        {animal.age} वर्ष • {animal.biyat} बार
                      </td>

                      {/* Price */}
                      <td className="p-3 sm:p-4 font-black text-emerald-800">
                        ₹{formatPrice(animal.price)}
                      </td>

                      {/* Video */}
                      <td className="p-3 sm:p-4">
                        {animal.video?.secure_url ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                            <Video className="w-3 h-3" />
                            <span>{t("admin.yes")}</span>
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">{t("admin.no")}</span>
                        )}
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="p-3 sm:p-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/admin/animals/${animal._id}/edit`}
                            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title={t("common.edit")}
                            aria-label="Edit animal"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setAnimalToDelete(animal)}
                            className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                            title={t("common.delete")}
                            aria-label="Delete animal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!animalToDelete}
        onClose={() => setAnimalToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        animalBreed={animalToDelete?.breed}
      />

      {/* Seller Profile Picture Update Modal */}
      <SellerProfileModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
        currentImage={sellerImage}
        onProfileUpdated={(newUrl) => {
          setSellerImage(newUrl);
          setToastMessage(t("toasts.sellerImageUpdated"));
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => {
          setToastMessage("पासवर्ड सफलतापूर्वक बदल दिया गया (Password updated successfully)");
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />
    </div>
  );
}
