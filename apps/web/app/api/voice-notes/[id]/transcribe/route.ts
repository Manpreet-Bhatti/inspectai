import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transcribeAudio } from "@/lib/ml-client";
import type { Tables } from "@/types/database";

type VoiceNote = Tables<"voice_notes">;
type Inspection = Tables<"inspections">;

/**
 * POST /api/voice-notes/[id]/transcribe
 *
 * Auth-gated proxy: fetches the voice note's storage_path and inspection_id,
 * then queues a transcription + summarization job on the ML service.
 * Results are written directly to the voice_notes row by the ML service,
 * which triggers a Supabase Realtime update on the frontend.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: voiceNote, error: fetchError } = (await supabase
      .from("voice_notes")
      .select("id, inspection_id, storage_path, processed_at")
      .eq("id", id)
      .single()) as {
      data: Pick<VoiceNote, "id" | "inspection_id" | "storage_path" | "processed_at"> | null;
      error: Error | null;
    };

    if (fetchError || !voiceNote) {
      return NextResponse.json(
        { error: "Voice note not found" },
        { status: 404 }
      );
    }

    // Verify the user owns the inspection this note belongs to.
    const { data: inspection, error: inspectionError } = (await supabase
      .from("inspections")
      .select("id, user_id")
      .eq("id", voiceNote.inspection_id)
      .single()) as {
      data: Pick<Inspection, "id" | "user_id"> | null;
      error: Error | null;
    };

    if (inspectionError || !inspection) {
      return NextResponse.json(
        { error: "Inspection not found" },
        { status: 404 }
      );
    }

    if (inspection.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Idempotent: skip if already processed.
    if (voiceNote.processed_at) {
      return NextResponse.json({
        voiceNoteId: id,
        status: "already_processed",
        message: "Voice note has already been transcribed",
      });
    }

    const result = await transcribeAudio(
      id,
      voiceNote.storage_path,
      voiceNote.inspection_id,
      user.id
    );

    return NextResponse.json({
      voiceNoteId: id,
      status: result.status,
      message: result.message ?? "Voice note queued for transcription and summarization",
    });
  } catch (error) {
    console.error("Error queuing transcription:", error);
    return NextResponse.json(
      { error: "Failed to queue transcription" },
      { status: 500 }
    );
  }
}
