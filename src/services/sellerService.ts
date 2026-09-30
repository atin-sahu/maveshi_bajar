import { connectToDatabase } from "@/lib/db";
import SellerSettings from "@/models/SellerSettings";
import { SITE_CONFIG } from "@/config/site";
import { deleteFromCloudinary } from "@/lib/cloudinary-server";

interface ISellerProfile {
  sellerName: string;
  sellerPhone: string;
  sellerWhatsapp: string;
  sellerProfileImage: string;
  sellerProfileImagePublicId?: string;
  sellerAddress: string;
  sellerExperience: string;
}

let inMemorySeller: ISellerProfile = {
  sellerName: SITE_CONFIG.SELLER_NAME,
  sellerPhone: SITE_CONFIG.SELLER_PHONE,
  sellerWhatsapp: SITE_CONFIG.SELLER_WHATSAPP,
  sellerProfileImage: SITE_CONFIG.SELLER_PROFILE_IMAGE,
  sellerProfileImagePublicId: "",
  sellerAddress: SITE_CONFIG.SELLER_ADDRESS,
  sellerExperience: SITE_CONFIG.SELLER_EXPERIENCE,
};

export class SellerService {
  /**
   * Get current seller contact and profile info
   */
  static async getSellerProfile() {
    const db = await connectToDatabase();
    if (db) {
      try {
        const settings = await SellerSettings.findOne().lean();
        if (settings) {
          return {
            sellerName: settings.sellerName || SITE_CONFIG.SELLER_NAME,
            sellerPhone: settings.sellerPhone || SITE_CONFIG.SELLER_PHONE,
            sellerWhatsapp: settings.sellerWhatsapp || SITE_CONFIG.SELLER_WHATSAPP,
            sellerProfileImage: settings.sellerProfileImage || SITE_CONFIG.SELLER_PROFILE_IMAGE,
            sellerProfileImagePublicId: settings.sellerProfileImagePublicId,
            sellerAddress: settings.sellerAddress || SITE_CONFIG.SELLER_ADDRESS,
            sellerExperience: settings.sellerExperience || SITE_CONFIG.SELLER_EXPERIENCE,
          };
        }
      } catch (err) {
        console.warn("[SellerService] DB lookup failed, falling back to current config:", err);
      }
    }

    return inMemorySeller;
  }

  /**
   * Update seller profile picture, cleaning up old Cloudinary asset
   */
  static async updateProfileImage(imageUrl: string, publicId: string) {
    const db = await connectToDatabase();
    if (db) {
      try {
        let settings = await SellerSettings.findOne();

        if (settings) {
          if (settings.sellerProfileImagePublicId && settings.sellerProfileImagePublicId !== publicId) {
            await deleteFromCloudinary(settings.sellerProfileImagePublicId, "image");
          }

          settings.sellerProfileImage = imageUrl;
          settings.sellerProfileImagePublicId = publicId;
          await settings.save();
        } else {
          settings = await SellerSettings.create({
            sellerProfileImage: imageUrl,
            sellerProfileImagePublicId: publicId,
          });
        }

        return settings;
      } catch (err) {
        console.error("[SellerService] Error updating seller profile in DB:", err);
      }
    }

    inMemorySeller = {
      ...inMemorySeller,
      sellerProfileImage: imageUrl,
      sellerProfileImagePublicId: publicId,
    };

    return inMemorySeller;
  }
}
