import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type Inspection = Tables<"inspections">;
type Photo = Tables<"photos">;

/**
 * GET /api/inspections/[id]/photos
 * Get all photos for an inspection
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: inspectionId } = await params;
    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        { error: "You do not have permission to view this inspection" },
        { status: 403 }
      );
    }

    // Fetch photos for this inspection
    const { data: photos, error: photosError } = (await supabase
      .from("photos")
      .select("*")
      .eq("inspection_id", inspectionId)
      .order("created_at", { ascending: false })) as {
      data: Photo[] | null;
      error: Error | null;
    };

    if (photosError) {
      console.error("Error fetching photos:", photosError);
      return NextResponse.json(
        { error: "Failed to fetch photos" },
        { status: 500 }
      );
    }

    // Generate signed URLs for each photo
    const photosWithUrls = await Promise.all(
      (photos || []).map(async (photo) => {
        const { data: urlData } = await supabase.storage
          .from("inspection-photos")
          .createSignedUrl(photo.storage_path, 3600);

        // Also try to get thumbnail URL if it exists
        let thumbnailUrl = null;
        if (photo.thumbnail_path) {
          const { data: thumbData } = await supabase.storage
            .from("thumbnails")
            .getPublicUrl(photo.thumbnail_path);
          thumbnailUrl = thumbData?.publicUrl || null;
        }

        return {
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
      })
    );

    return NextResponse.json({ data: photosWithUrls });
  } catch (error) {
    console.error("Error in photos GET:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
