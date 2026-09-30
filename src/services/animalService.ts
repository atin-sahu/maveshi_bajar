import { connectToDatabase } from "@/lib/db";
import Animal, { IAnimalDocument } from "@/models/Animal";
import { APP_CONFIG, AnimalCategory } from "@/config/app";
import { deleteFromCloudinary } from "@/lib/cloudinary-server";
import { ICloudinaryAsset, IAnimal } from "@/types";

export interface CreateAnimalInput {
  category: AnimalCategory;
  breed: string;
  age: number;
  biyat: number;
  price: number;
  gender: "male" | "female";
  images: ICloudinaryAsset[];
  thumbnail: ICloudinaryAsset;
  video?: ICloudinaryAsset | null;
}

// Animals list (empty by default; only real admin-created animals are displayed)
const INITIAL_DEMO_ANIMALS: IAnimal[] = [];

let inMemoryAnimals: IAnimal[] = [];

export class AnimalService {
  /**
   * Get all animals, optionally filtered by category
   */
  static async getAllAnimals(category?: string) {
    const db = await connectToDatabase();
    if (db) {
      try {
        const query: Record<string, unknown> = {};
        if (category && category !== "all") {
          query.category = category;
        }
        const animals = await Animal.find(query).sort({ createdAt: -1 }).lean();
        return animals.map((a) => ({
          ...a,
          _id: (a._id as { toString(): string }).toString(),
        }));
      } catch (err) {
        console.error("DB query failed, fallback to in-memory store:", err);
      }
    }

    // In-memory fallback
    if (category && category !== "all") {
      return inMemoryAnimals.filter((a) => a.category === category);
    }
    return inMemoryAnimals;
  }

  /**
   * Get a single animal by ID
   */
  static async getAnimalById(id: string) {
    const db = await connectToDatabase();
    if (db) {
      try {
        const animal = await Animal.findById(id).lean();
        if (animal) {
          return {
            ...animal,
            _id: (animal._id as { toString(): string }).toString(),
          };
        }
      } catch {
        // Fallback to in-memory lookup
      }
    }

    const found = inMemoryAnimals.find((a) => a._id === id);
    return found || null;
  }

  /**
   * Get current animal count
   */
  static async getAnimalCount(): Promise<number> {
    const db = await connectToDatabase();
    if (db) {
      try {
        return await Animal.countDocuments();
      } catch {
        // Fallback to in-memory count
      }
    }
    return inMemoryAnimals.length;
  }

  /**
   * Create new animal with strict limit enforcement
   */
  static async createAnimal(data: CreateAnimalInput) {
    // 1. Enforce MAX_ANIMALS = 10 limit
    const currentCount = await this.getAnimalCount();
    if (currentCount >= APP_CONFIG.MAX_ANIMALS) {
      throw new Error(`MAX_ANIMALS_REACHED:${APP_CONFIG.MAX_ANIMALS}`);
    }

    // 2. Enforce image count limits
    if (!data.images || data.images.length < APP_CONFIG.MIN_IMAGES_PER_ANIMAL) {
      throw new Error(`MIN_IMAGES_REQUIRED:${APP_CONFIG.MIN_IMAGES_PER_ANIMAL}`);
    }
    if (data.images.length > APP_CONFIG.MAX_IMAGES_PER_ANIMAL) {
      throw new Error(`MAX_IMAGES_EXCEEDED:${APP_CONFIG.MAX_IMAGES_PER_ANIMAL}`);
    }

    // 3. Enforce thumbnail
    if (!data.thumbnail || !data.thumbnail.public_id) {
      throw new Error("THUMBNAIL_REQUIRED");
    }

    const db = await connectToDatabase();
    if (db) {
      const newAnimal = await Animal.create(data);
      return {
        ...newAnimal.toObject(),
        _id: newAnimal._id.toString(),
      };
    }

    // Save in inMemoryAnimals
    const newDoc: IAnimal = {
      _id: `animal-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryAnimals.unshift(newDoc);
    return newDoc;
  }

  /**
   * Update existing animal
   */
  static async updateAnimal(id: string, data: Partial<CreateAnimalInput>) {
    if (data.images) {
      if (data.images.length < APP_CONFIG.MIN_IMAGES_PER_ANIMAL) {
        throw new Error(`MIN_IMAGES_REQUIRED:${APP_CONFIG.MIN_IMAGES_PER_ANIMAL}`);
      }
      if (data.images.length > APP_CONFIG.MAX_IMAGES_PER_ANIMAL) {
        throw new Error(`MAX_IMAGES_EXCEEDED:${APP_CONFIG.MAX_IMAGES_PER_ANIMAL}`);
      }
    }

    const db = await connectToDatabase();
    if (db) {
      const updated = await Animal.findByIdAndUpdate(id, data, { new: true }).lean();
      if (updated) {
        return {
          ...updated,
          _id: (updated._id as { toString(): string }).toString(),
        };
      }
    }

    const index = inMemoryAnimals.findIndex((a) => a._id === id);
    if (index >= 0) {
      inMemoryAnimals[index] = {
        ...inMemoryAnimals[index],
        ...data,
        updatedAt: new Date().toISOString(),
      } as IAnimal;
      return inMemoryAnimals[index];
    }

    return null;
  }

  /**
   * Delete animal: cleans up all Cloudinary assets then deletes document
   */
  static async deleteAnimal(id: string) {
    const db = await connectToDatabase();
    if (db) {
      const animal = (await Animal.findById(id)) as IAnimalDocument | null;
      if (animal) {
        // 1. Delete all Cloudinary images
        if (animal.images && animal.images.length > 0) {
          await Promise.allSettled(
            animal.images.map((img) => deleteFromCloudinary(img.public_id, "image"))
          );
        }

        // 2. Delete Cloudinary video if present
        if (animal.video && animal.video.public_id) {
          await deleteFromCloudinary(animal.video.public_id, "video");
        }

        // 3. Delete MongoDB document
        await Animal.findByIdAndDelete(id);
        return { success: true };
      }
    }

    // In-memory cleanup
    const index = inMemoryAnimals.findIndex((a) => a._id === id);
    if (index >= 0) {
      const animal = inMemoryAnimals[index];
      if (animal.images) {
        await Promise.allSettled(
          animal.images.map((img) => deleteFromCloudinary(img.public_id, "image"))
        );
      }
      if (animal.video?.public_id) {
        await deleteFromCloudinary(animal.video.public_id, "video");
      }
      inMemoryAnimals.splice(index, 1);
      return { success: true };
    }

    throw new Error("ANIMAL_NOT_FOUND");
  }
}
