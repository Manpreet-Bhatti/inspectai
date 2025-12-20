import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type Photo = Tables<"photos">;
type Inspection = Tables<"inspections">;

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
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch photo
    const { data: photo, error } = (await supabase
      .from("photos")
      .select("*")
      .eq("id", id)
      .single()) as { data: Photo | null; error: Error | null };

    if (error || !photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Verify user owns the inspection this photo belongs to
    const { data: inspection, error: inspectionError } = (await supabase
      .from("inspections")
      .select("id, user_id")
      .eq("id", photo.inspection_id)
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
        { error: "You do not have permission to view this photo" },
        { status: 403 }
      );
    }

    // Get signed URL for the photo
    const { data: urlData } = await supabase.storage
      .from("inspection-photos")
      .createSignedUrl(photo.storage_path, 3600);

    // Get thumbnail URL if exists
    let thumbnailUrl = null;
    if (photo.thumbnail_path) {
      const { data: thumbData } = await supabase.storage
        .from("thumbnails")
        .getPublicUrl(photo.thumbnail_path);
      thumbnailUrl = thumbData?.publicUrl || null;
    }

    // Transform to camelCase for API response
    const response = {
      id: photo.id,
      inspectionId: photo.inspection_id,
      fileName: photo.file_name,
      storagePath: photo.storage_path,
      originalUrl: urlData?.signedUrl || null,
      thumbnailUrl: thumbnailUrl || urlData?.signedUrl || null,
      category: photo.category?.toUpperCase() || "OTHER",
      location: photo.location,
      width: photo.width,
      height: photo.height,
      aiCaption: photo.ai_caption,
      aiObjects: photo.ai_objects,
      aiCondition: photo.ai_condition,
      aiConfidence: photo.ai_confidence,
      processedAt: photo.processed_at,
      error: photo.error,
      createdAt: photo.created_at,
    };

    return NextResponse.json(response);
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
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch photo to get storage path
    const { data: photo, error: fetchError } = (await supabase
      .from("photos")
      .select("id, inspection_id, storage_path, thumbnail_path")
      .eq("id", id)
      .single()) as {
      data: Pick<
        Photo,
        "id" | "inspection_id" | "storage_path" | "thumbnail_path"
      > | null;
      error: Error | null;
    };

    if (fetchError || !photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Verify user owns the inspection
    const { data: inspection, error: inspectionError } = (await supabase
      .from("inspections")
      .select("id, user_id")
      .eq("id", photo.inspection_id)
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
        { error: "You do not have permission to delete this photo" },
        { status: 403 }
      );
    }

    // Delete from storage
    await supabase.storage
      .from("inspection-photos")
      .remove([photo.storage_path]);

    // Delete thumbnail if exists
    if (photo.thumbnail_path) {
      await supabase.storage.from("thumbnails").remove([photo.thumbnail_path]);
    }

    // Delete from database
    const { error } = await supabase.from("photos").delete().eq("id", id);

    if (error) {
      console.error("Error deleting photo:", error);
      return NextResponse.json(
        { error: "Failed to delete photo" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
