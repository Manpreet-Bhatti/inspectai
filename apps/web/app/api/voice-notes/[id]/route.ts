import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type VoiceNote = Tables<"voice_notes">;
type Inspection = Tables<"inspections">;

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
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch voice note
    const { data: voiceNote, error } = (await supabase
      .from("voice_notes")
      .select("*")
      .eq("id", id)
      .single()) as { data: VoiceNote | null; error: Error | null };

    if (error || !voiceNote) {
      return NextResponse.json(
        { error: "Voice note not found" },
        { status: 404 }
      );
    }

    // Verify user owns the inspection this voice note belongs to
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
      return NextResponse.json(
        { error: "You do not have permission to view this voice note" },
        { status: 403 }
      );
    }

    // Get signed URL for the voice note
    const { data: urlData } = await supabase.storage
      .from("voice-notes")
      .createSignedUrl(voiceNote.storage_path, 3600);

    // Transform to camelCase for API response
    const response = {
      id: voiceNote.id,
      inspectionId: voiceNote.inspection_id,
      storagePath: voiceNote.storage_path,
      audioUrl: urlData?.signedUrl || null,
      duration: voiceNote.duration,
      transcript: voiceNote.transcript,
      summary: voiceNote.summary,
      processedAt: voiceNote.processed_at,
      error: voiceNote.error,
      createdAt: voiceNote.created_at,
    };

    return NextResponse.json(response);
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
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch voice note to get storage path
    const { data: voiceNote, error: fetchError } = (await supabase
      .from("voice_notes")
      .select("id, inspection_id, storage_path")
      .eq("id", id)
      .single()) as {
      data: Pick<VoiceNote, "id" | "inspection_id" | "storage_path"> | null;
      error: Error | null;
    };

    if (fetchError || !voiceNote) {
      return NextResponse.json(
        { error: "Voice note not found" },
        { status: 404 }
      );
    }

    // Verify user owns the inspection
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
      return NextResponse.json(
        { error: "You do not have permission to delete this voice note" },
        { status: 403 }
      );
    }

    // Delete from storage
    await supabase.storage.from("voice-notes").remove([voiceNote.storage_path]);

    // Delete from database
    const { error } = await supabase.from("voice_notes").delete().eq("id", id);

    if (error) {
      console.error("Error deleting voice note:", error);
      return NextResponse.json(
        { error: "Failed to delete voice note" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting voice note:", error);
    return NextResponse.json(
      { error: "Failed to delete voice note" },
      { status: 500 }
    );
  }
}
