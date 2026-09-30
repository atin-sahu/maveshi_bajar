import { NextRequest, NextResponse } from "next/server";
import { AnimalService } from "@/services/animalService";
import { verifyAdminSession } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Public: GET /api/animals/[id]
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const animal = await AnimalService.getAnimalById(id);

    if (!animal) {
      return NextResponse.json({ error: "Animal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, animal });
  } catch (error) {
    console.error("Get single animal error:", error);
    return NextResponse.json(
      { error: "Failed to fetch animal details" },
      { status: 500 }
    );
  }
}

// Admin: PUT /api/animals/[id]
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await verifyAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const updated = await AnimalService.updateAnimal(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Animal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, animal: updated });
  } catch (error: unknown) {
    console.error("Update animal error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update animal";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Admin: DELETE /api/animals/[id]
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await verifyAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await AnimalService.deleteAnimal(id);

    return NextResponse.json({
      success: true,
      message: "Animal and all associated Cloudinary media deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete animal error:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete animal";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
