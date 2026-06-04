import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type Inspection = Tables<"inspections">;
type VoiceNote = Tables<"voice_notes">;

/**
 * GET /api/inspections/[id]/voice-notes
 * List all voice notes for an inspection
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inspectionId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: inspection, error: inspectionError } = (await supabase
      .from("inspections")
      .select("id, user_id")
      .eq("id", inspectionId)
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

    const { data: voiceNotes, error } = (await supabase
      .from("voice_notes")
      .select("*")
      .eq("inspection_id", inspectionId)
      .order("created_at", { ascending: false })) as {
      data: VoiceNote[] | null;
      error: Error | null;
    };

    if (error) {
      console.error("Error fetching voice notes:", error);
      return NextResponse.json(
        { error: "Failed to fetch voice notes" },
        { status: 500 }
      );
    }

    const notesWithUrls = await Promise.all(
      (voiceNotes || []).map(async (note) => {
        const { data: urlData } = await supabase.storage
          .from("voice-notes")
          .createSignedUrl(note.storage_path, 3600);

        return {
          id: note.id,
          inspectionId: note.inspection_id,
          storagePath: note.storage_path,
          audioUrl: urlData?.signedUrl || null,
          duration: note.duration,
          transcript: note.transcript,
          summary: note.summary,
          processedAt: note.processed_at,
          error: note.error,
          createdAt: note.created_at,
        };
      })
    );

    return NextResponse.json({ data: notesWithUrls });
  } catch (error) {
    console.error("Error in voice-notes GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
