import { NextRequest, NextResponse } from "next/server";

// TODO: Import prisma client and S3 utilities
// import { prisma } from "@inspectai/database";

/**
 * POST /api/voice-notes
 * Upload a voice note for an inspection
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const inspectionId = formData.get("inspectionId") as string;
    const audio = formData.get("audio") as File;
    const duration = parseInt(formData.get("duration") as string) || 0;

    if (!inspectionId) {
      return NextResponse.json(
        { error: "Missing inspectionId" },
        { status: 400 }
      );
    }

    if (!audio) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // TODO: Implement actual file upload to S3
    const voiceNote = {
      id: `voice-${Date.now()}`,
      inspectionId,
      audioUrl: `/uploads/audio/${audio.name}`,
      duration,
      transcript: null,
      summary: null,
      processedAt: null,
      createdAt: new Date(),
    };

    return NextResponse.json(voiceNote, { status: 201 });
  } catch (error) {
    console.error("Error uploading voice note:", error);
    return NextResponse.json(
      { error: "Failed to upload voice note" },
      { status: 500 }
    );
  }
}
