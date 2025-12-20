import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database, Tables, TablesUpdate } from "@/types/database";

type Finding = Tables<"findings">;
type FindingUpdate = TablesUpdate<"findings">;
type Inspection = Tables<"inspections">;
type FindingCategory = Database["public"]["Enums"]["finding_category"];
type Severity = Database["public"]["Enums"]["severity"];
type FindingStatus = Database["public"]["Enums"]["finding_status"];

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
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch finding with related photo
    type FindingWithPhoto = Finding & {
      photo: {
        id: string;
        file_name: string;
        storage_path: string;
        thumbnail_path: string | null;
      } | null;
    };

    const { data: finding, error } = (await supabase
      .from("findings")
      .select(
        `
        *,
        photo:photos(id, file_name, storage_path, thumbnail_path)
      `
      )
      .eq("id", id)
      .single()) as { data: FindingWithPhoto | null; error: Error | null };

    if (error || !finding) {
      return NextResponse.json({ error: "Finding not found" }, { status: 404 });
    }

    // Verify user owns the inspection this finding belongs to
    const { data: inspection, error: inspectionError } = (await supabase
      .from("inspections")
      .select("id, user_id")
      .eq("id", finding.inspection_id)
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
        { error: "You do not have permission to view this finding" },
        { status: 403 }
      );
    }

    // Get signed URL for photo if exists
    let photoData = null;
    if (finding.photo) {
      const photo = finding.photo as {
        id: string;
        file_name: string;
        storage_path: string;
        thumbnail_path: string | null;
      };
      const { data: urlData } = await supabase.storage
        .from("inspection-photos")
        .createSignedUrl(photo.storage_path, 3600);

      let thumbnailUrl = null;
      if (photo.thumbnail_path) {
        const { data: thumbData } = await supabase.storage
          .from("thumbnails")
          .getPublicUrl(photo.thumbnail_path);
        thumbnailUrl = thumbData?.publicUrl || null;
      }

      photoData = {
        id: photo.id,
        fileName: photo.file_name,
        originalUrl: urlData?.signedUrl || null,
        thumbnailUrl: thumbnailUrl || urlData?.signedUrl || null,
      };
    }

    // Transform to camelCase for API response
    const response = {
      id: finding.id,
      inspectionId: finding.inspection_id,
      title: finding.title,
      description: finding.description,
      category: finding.category,
      severity: finding.severity,
      location: finding.location,
      costEstimate: finding.cost_estimate,
      costMin: finding.cost_min,
      costMax: finding.cost_max,
      status: finding.status,
      isAiGenerated: finding.is_ai_generated,
      confidence: finding.confidence,
      photoId: finding.photo_id,
      voiceNoteId: finding.voice_note_id,
      photo: photoData,
      createdAt: finding.created_at,
      updatedAt: finding.updated_at,
    };

    return NextResponse.json(response);
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
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch existing finding
    const { data: existing, error: fetchError } = (await supabase
      .from("findings")
      .select("id, inspection_id")
      .eq("id", id)
      .single()) as {
      data: Pick<Finding, "id" | "inspection_id"> | null;
      error: Error | null;
    };

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Finding not found" }, { status: 404 });
    }

    // Verify user owns the inspection
    const { data: inspection, error: inspectionError } = (await supabase
      .from("inspections")
      .select("id, user_id")
      .eq("id", existing.inspection_id)
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
        { error: "You do not have permission to update this finding" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Build update object (only include provided fields)
    const updateData: FindingUpdate = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.category !== undefined) {
      updateData.category = body.category.toLowerCase() as FindingCategory;
    }
    if (body.severity !== undefined) {
      updateData.severity = body.severity.toLowerCase() as Severity;
    }
    if (body.location !== undefined) updateData.location = body.location;
    if (body.costEstimate !== undefined)
      updateData.cost_estimate = body.costEstimate;
    if (body.costMin !== undefined) updateData.cost_min = body.costMin;
    if (body.costMax !== undefined) updateData.cost_max = body.costMax;
    if (body.status !== undefined) {
      updateData.status = body.status.toLowerCase() as FindingStatus;
    }
    if (body.photoId !== undefined) updateData.photo_id = body.photoId;
    if (body.voiceNoteId !== undefined)
      updateData.voice_note_id = body.voiceNoteId;

    const { data: finding, error } = (await supabase
      .from("findings")
      .update(updateData as never)
      .eq("id", id)
      .select()
      .single()) as { data: Finding | null; error: Error | null };

    if (error || !finding) {
      console.error("Error updating finding:", error);
      return NextResponse.json(
        { error: "Failed to update finding" },
        { status: 500 }
      );
    }

    // Transform to camelCase for API response
    const response = {
      id: finding.id,
      inspectionId: finding.inspection_id,
      title: finding.title,
      description: finding.description,
      category: finding.category,
      severity: finding.severity,
      location: finding.location,
      costEstimate: finding.cost_estimate,
      costMin: finding.cost_min,
      costMax: finding.cost_max,
      status: finding.status,
      isAiGenerated: finding.is_ai_generated,
      confidence: finding.confidence,
      photoId: finding.photo_id,
      voiceNoteId: finding.voice_note_id,
      createdAt: finding.created_at,
      updatedAt: finding.updated_at,
    };

    return NextResponse.json(response);
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
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch existing finding
    const { data: existing, error: fetchError } = (await supabase
      .from("findings")
      .select("id, inspection_id")
      .eq("id", id)
      .single()) as {
      data: Pick<Finding, "id" | "inspection_id"> | null;
      error: Error | null;
    };

    if (fetchError || !existing) {
      return NextResponse.json({ error: "Finding not found" }, { status: 404 });
    }

    // Verify user owns the inspection
    const { data: inspection, error: inspectionError } = (await supabase
      .from("inspections")
      .select("id, user_id")
      .eq("id", existing.inspection_id)
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
        { error: "You do not have permission to delete this finding" },
        { status: 403 }
      );
    }

    // Delete the finding
    const { error } = await supabase.from("findings").delete().eq("id", id);

    if (error) {
      console.error("Error deleting finding:", error);
      return NextResponse.json(
        { error: "Failed to delete finding" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting finding:", error);
    return NextResponse.json(
      { error: "Failed to delete finding" },
      { status: 500 }
    );
  }
}
