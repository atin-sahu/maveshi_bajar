import { AnimalCategory, AnimalGender } from "@/config/app";

export interface ICloudinaryAsset {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
  duration?: number;
  resource_type?: "image" | "video";
}

export interface IAnimal {
  _id: string;
  category: AnimalCategory;
  breed: string;
  age: number;
  biyat: number;
  price: number;
  gender: AnimalGender;
  images: ICloudinaryAsset[];
  thumbnail: ICloudinaryAsset;
  video?: ICloudinaryAsset | null;
  createdAt: string;
  updatedAt: string;
}

export interface ISellerSettings {
  sellerName: string;
  sellerPhone: string;
  sellerWhatsapp: string;
  sellerProfileImage: string;
  sellerAddress: string;
  sellerExperience?: string;
}

export type Locale = "hi" | "en";
