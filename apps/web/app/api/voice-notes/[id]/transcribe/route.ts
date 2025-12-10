import { NextRequest, NextResponse } from "next/server";

// TODO: Import ML service client
// import { mlServiceClient } from "@/lib/ml-service";

/**
 * POST /api/voice-notes/[id]/transcribe
 * Queue voice note for transcription
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Queue transcription job with ML service
    // const result = await mlServiceClient.transcribeAudio(audioUrl);

    const transcriptionResult = {
      voiceNoteId: id,
      status: "queued",
      message: "Voice note transcription has been queued",
      estimatedTime: "10-20 seconds",
    };

    return NextResponse.json(transcriptionResult);
  } catch (error) {
    console.error("Error queueing transcription:", error);
    return NextResponse.json(
      { error: "Failed to queue transcription" },
      { status: 500 }
    );
  }
}
