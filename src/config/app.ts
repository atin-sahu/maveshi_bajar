/**
 * Centralized Application Configuration & Business Rules
 * Future changes (e.g. MAX_VIDEO_DURATION_SECONDS from 20 -> 300)
 * only need to be modified here.
 */
export const APP_CONFIG = {
  MAX_ANIMALS: 10,
  MIN_IMAGES_PER_ANIMAL: 1,
  MAX_IMAGES_PER_ANIMAL: 5,
  MAX_VIDEOS_PER_ANIMAL: 1,
  MAX_VIDEO_DURATION_SECONDS: 20,
  MAX_VIDEO_RESOLUTION: 1080,
  CLOUDINARY_FOLDERS: {
    IMAGES: "animal-app/animals/images",
    VIDEOS: "animal-app/animals/videos",
    SELLER: "animal-app/seller",
  },
} as const;

export type AnimalCategory = "cow" | "buffalo" | "buffalo_calf";
export type AnimalGender = "male" | "female";
