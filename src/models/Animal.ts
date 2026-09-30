import mongoose, { Schema, Document, Model } from "mongoose";
import { AnimalCategory, AnimalGender } from "@/config/app";
import { ICloudinaryAsset } from "@/types";

export interface IAnimalDocument extends Document {
  category: AnimalCategory;
  breed: string;
  age: number;
  biyat: number;
  price: number;
  gender: AnimalGender;
  images: ICloudinaryAsset[];
  thumbnail: ICloudinaryAsset;
  video?: ICloudinaryAsset | null;
  createdAt: Date;
  updatedAt: Date;
}

const CloudinaryAssetSchema = new Schema(
  {
    public_id: { type: String, required: true },
    secure_url: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
    format: { type: String },
    duration: { type: Number },
    resource_type: { type: String, enum: ["image", "video"], default: "image" },
  },
  { _id: false }
);

const AnimalSchema = new Schema<IAnimalDocument>(
  {
    category: {
      type: String,
      required: true,
      enum: ["cow", "buffalo", "buffalo_calf"],
      index: true,
    },
    breed: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
    },
    biyat: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    images: {
      type: [CloudinaryAssetSchema],
      required: true,
      validate: [
        (val: ICloudinaryAsset[]) => val.length >= 1 && val.length <= 5,
        "Images count must be between 1 and 5",
      ],
    },
    thumbnail: {
      type: CloudinaryAssetSchema,
      required: true,
    },
    video: {
      type: CloudinaryAssetSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model overwrite error during hot reloads
const Animal: Model<IAnimalDocument> =
  mongoose.models.Animal || mongoose.model<IAnimalDocument>("Animal", AnimalSchema);

export default Animal;
