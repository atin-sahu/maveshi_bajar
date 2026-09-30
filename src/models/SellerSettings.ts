import mongoose, { Schema, Document, Model } from "mongoose";
import { SITE_CONFIG } from "@/config/site";

export interface ISellerSettingsDocument extends Document {
  sellerName: string;
  sellerPhone: string;
  sellerWhatsapp: string;
  sellerProfileImage: string;
  sellerProfileImagePublicId?: string;
  sellerAddress: string;
  sellerExperience: string;
  updatedAt: Date;
}

const SellerSettingsSchema = new Schema<ISellerSettingsDocument>(
  {
    sellerName: { type: String, default: SITE_CONFIG.SELLER_NAME },
    sellerPhone: { type: String, default: SITE_CONFIG.SELLER_PHONE },
    sellerWhatsapp: { type: String, default: SITE_CONFIG.SELLER_WHATSAPP },
    sellerProfileImage: { type: String, default: SITE_CONFIG.SELLER_PROFILE_IMAGE },
    sellerProfileImagePublicId: { type: String },
    sellerAddress: { type: String, default: SITE_CONFIG.SELLER_ADDRESS },
    sellerExperience: { type: String, default: SITE_CONFIG.SELLER_EXPERIENCE },
  },
  {
    timestamps: true,
  }
);

const SellerSettings: Model<ISellerSettingsDocument> =
  mongoose.models.SellerSettings ||
  mongoose.model<ISellerSettingsDocument>("SellerSettings", SellerSettingsSchema);

export default SellerSettings;
