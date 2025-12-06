import { NextRequest, NextResponse } from "next/server";

// TODO: Import prisma client
// import { prisma } from "@inspectai/database";

/**
 * GET /api/photos/[id]
 * Get photo details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Replace with actual database query
    const photo = {
      id,
      inspectionId: "1",
      fileName: "exterior_front.jpg",
      originalUrl: "/uploads/exterior_front.jpg",
      thumbnailUrl: "/uploads/thumbs/exterior_front.jpg",
      category: "EXTERIOR",
      location: "Front Entrance",
      width: 1920,
      height: 1080,
      aiCaption: "Front view of a two-story single family home",
      aiObjects: [
        { label: "house", confidence: 0.95, bbox: [100, 100, 800, 600] },
        { label: "door", confidence: 0.89, bbox: [400, 400, 100, 200] },
      ],
      aiCondition: "Good condition",
      aiConfidence: 0.92,
      processedAt: new Date(),
      createdAt: new Date(),
    };

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error fetching photo:", error);
    return NextResponse.json(
      { error: "Failed to fetch photo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/photos/[id]
 * Delete a photo
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Delete from S3 and database
    console.log("Deleting photo:", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
