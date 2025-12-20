import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert } from "@/types/database";

type VoiceNote = Tables<"voice_notes">;
type VoiceNoteInsert = TablesInsert<"voice_notes">;
type Inspection = Tables<"inspections">;

/**
 * POST /api/voice-notes
 * Upload a voice note for an inspection
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Verify the user owns this inspection
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
      return NextResponse.json(
        { error: "You do not have permission to upload to this inspection" },
        { status: 403 }
      );
    }

    // Generate unique file path
    const fileExt = audio.name.split(".").pop() || "webm";
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const storagePath = `${user.id}/${inspectionId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("voice-notes")
      .upload(storagePath, audio, {
        contentType: audio.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Failed to upload voice note: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Create voice note record in database
    const voiceNoteData: VoiceNoteInsert = {
      inspection_id: inspectionId,
      storage_path: storagePath,
      duration: duration,
    };

    const { data: voiceNote, error: dbError } = (await supabase
      .from("voice_notes")
      .insert(voiceNoteData as never)
      .select()
      .single()) as { data: VoiceNote | null; error: Error | null };

    if (dbError || !voiceNote) {
      console.error("Database insert error:", dbError);
      // Try to clean up the uploaded file
      await supabase.storage.from("voice-notes").remove([storagePath]);
      return NextResponse.json(
        {
          error: `Failed to save voice note record: ${dbError?.message || "Unknown error"}`,
        },
        { status: 500 }
      );
    }

    // Get signed URL for the voice note (valid for 1 hour)
    const { data: urlData } = await supabase.storage
      .from("voice-notes")
      .createSignedUrl(storagePath, 3600);

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

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error uploading voice note:", error);
    return NextResponse.json(
      { error: "Failed to upload voice note" },
      { status: 500 }
    );
  }
}
