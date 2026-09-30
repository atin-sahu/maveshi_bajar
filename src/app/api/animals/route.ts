import { NextRequest, NextResponse } from "next/server";
import { AnimalService } from "@/services/animalService";
import { verifyAdminSession } from "@/lib/auth";
import { APP_CONFIG } from "@/config/app";
import { getDbStatus } from "@/lib/db";

// Public: GET /api/animals
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;

    const animals = await AnimalService.getAllAnimals(category);
    const count = await AnimalService.getAnimalCount();
    const dbStatus = getDbStatus();

    return NextResponse.json({
      success: true,
      animals,
      count,
      maxAnimals: APP_CONFIG.MAX_ANIMALS,
      database: dbStatus,
    });
  } catch (error) {
    console.error("Get animals API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch animals" },
      { status: 500 }
    );
  }
}

// Admin: POST /api/animals
export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { category, breed, age, biyat, price, gender, images, thumbnail, video } = body || {};

    // Validate required fields
    if (!category || !breed || age === undefined || price === undefined || !gender) {
      return NextResponse.json(
        { error: "Missing required animal fields" },
        { status: 400 }
      );
    }

    // Validate category
    if (!["cow", "buffalo", "buffalo_calf"].includes(category)) {
      return NextResponse.json(
        { error: "Invalid category. Must be cow, buffalo, or buffalo_calf." },
        { status: 400 }
      );
    }

    // Validate gender
    if (!["male", "female"].includes(gender)) {
      return NextResponse.json(
        { error: "Invalid gender. Must be male or female." },
        { status: 400 }
      );
    }

    // Validate price and age
    const numPrice = Number(price);
    const numAge = Number(age);
    const numBiyat = Number(biyat || 0);

    if (isNaN(numPrice) || numPrice < 0) {
      return NextResponse.json({ error: "Invalid price value" }, { status: 400 });
    }
    if (isNaN(numAge) || numAge < 0) {
      return NextResponse.json({ error: "Invalid age value" }, { status: 400 });
    }
    if (isNaN(numBiyat) || numBiyat < 0) {
      return NextResponse.json({ error: "Invalid biyat value" }, { status: 400 });
    }

    // Attempt creation with AnimalService
    const newAnimal = await AnimalService.createAnimal({
      category,
      breed: breed.trim(),
      age: numAge,
      biyat: numBiyat,
      price: numPrice,
      gender,
      images,
      thumbnail,
      video: video || null,
    });

    return NextResponse.json({
      success: true,
      animal: newAnimal,
    });
  } catch (error: unknown) {
    console.error("Create animal API error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create animal";

    if (msg.startsWith("MAX_ANIMALS_REACHED")) {
      return NextResponse.json(
        {
          error: "MAX_ANIMALS_REACHED",
          messageHi: `आप अधिकतम ${APP_CONFIG.MAX_ANIMALS} पशु ही सूचीबद्ध कर सकते हैं।`,
          messageEn: `You can list a maximum of ${APP_CONFIG.MAX_ANIMALS} animals.`,
          max: APP_CONFIG.MAX_ANIMALS,
        },
        { status: 400 }
      );
    }

    if (msg.startsWith("MIN_IMAGES_REQUIRED") || msg.startsWith("MAX_IMAGES_EXCEEDED")) {
      return NextResponse.json(
        {
          error: "INVALID_IMAGE_COUNT",
          messageHi: `कम से कम ${APP_CONFIG.MIN_IMAGES_PER_ANIMAL} और अधिकतम ${APP_CONFIG.MAX_IMAGES_PER_ANIMAL} फोटो अनिवार्य हैं।`,
          messageEn: `At least ${APP_CONFIG.MIN_IMAGES_PER_ANIMAL} and at most ${APP_CONFIG.MAX_IMAGES_PER_ANIMAL} photos required.`,
        },
        { status: 400 }
      );
    }

    if (msg === "THUMBNAIL_REQUIRED") {
      return NextResponse.json(
        {
          error: "THUMBNAIL_REQUIRED",
          messageHi: "कृपया एक मुख्य फोटो (Thumbnail) चुनें।",
          messageEn: "Please select a main thumbnail photo.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
