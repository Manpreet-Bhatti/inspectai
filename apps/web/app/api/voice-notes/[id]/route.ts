import { NextRequest, NextResponse } from "next/server";

// TODO: Import prisma client
// import { prisma } from "@inspectai/database";

/**
 * GET /api/voice-notes/[id]
 * Get voice note details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Replace with actual database query
    const voiceNote = {
      id,
      inspectionId: "1",
      audioUrl: "/uploads/audio/note-1.webm",
      duration: 45,
      transcript:
        "The living room shows signs of water damage on the ceiling. There appears to be a leak from the roof or possibly a plumbing issue in the bathroom above.",
      summary:
        "Water damage observed in living room ceiling, possible roof or plumbing leak.",
      processedAt: new Date(),
      createdAt: new Date(),
    };

    return NextResponse.json(voiceNote);
  } catch (error) {
    console.error("Error fetching voice note:", error);
    return NextResponse.json(
      { error: "Failed to fetch voice note" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/voice-notes/[id]
 * Delete a voice note
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Delete from S3 and database
    console.log("Deleting voice note:", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting voice note:", error);
    return NextResponse.json(
      { error: "Failed to delete voice note" },
      { status: 500 }
    );
  }
}
