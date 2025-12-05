import { NextRequest, NextResponse } from "next/server";

// TODO: Import prisma client
// import { prisma } from "@inspectai/database";

/**
 * GET /api/findings/[id]
 * Get finding details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Replace with actual database query
    const finding = {
      id,
      inspectionId: "1",
      title: "Water damage on ceiling",
      description:
        "Visible water staining and discoloration on living room ceiling",
      category: "STRUCTURAL",
      severity: "MAJOR",
      location: "Living Room",
      costEstimate: 2500,
      costMin: 1500,
      costMax: 4000,
      status: "ACTIVE",
      isAiGenerated: true,
      confidence: 0.92,
      photoId: "3",
      photo: {
        id: "3",
        thumbnailUrl: "/uploads/thumbs/living_room.jpg",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(finding);
  } catch (error) {
    console.error("Error fetching finding:", error);
    return NextResponse.json(
      { error: "Failed to fetch finding" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/findings/[id]
 * Update a finding
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Replace with actual database update
    const updated = {
      id,
      ...body,
      updatedAt: new Date(),
    };

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating finding:", error);
    return NextResponse.json(
      { error: "Failed to update finding" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/findings/[id]
 * Delete a finding
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Replace with actual database deletion
    console.log("Deleting finding:", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting finding:", error);
    return NextResponse.json(
      { error: "Failed to delete finding" },
      { status: 500 }
    );
  }
}
