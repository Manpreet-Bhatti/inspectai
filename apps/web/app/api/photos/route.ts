import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database, Tables, TablesInsert } from "@/types/database";

type PhotoCategory = Database["public"]["Enums"]["photo_category"];
type Inspection = Tables<"inspections">;
type Photo = Tables<"photos">;
type PhotoInsert = TablesInsert<"photos">;

/**
 * POST /api/photos
 * Upload photos for an inspection to Supabase Storage
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
    const category =
      ((formData.get("category") as string)?.toLowerCase() as PhotoCategory) ||
      "other";
    const location = formData.get("location") as string | null;
    const files = formData.getAll("files") as File[];

    if (!inspectionId) {
      return NextResponse.json(
        { error: "Missing inspectionId" },
        { status: 400 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
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

    // Upload files to Supabase Storage and create database records
    const uploadedPhotos = await Promise.all(
      files.map(async (file) => {
        // Generate unique file path
        const fileExt = file.name.split(".").pop() || "jpg";
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const storagePath = `${user.id}/${inspectionId}/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("inspection-photos")
          .upload(storagePath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          throw new Error(
            `Failed to upload ${file.name}: ${uploadError.message}`
          );
        }

        // Create photo record in database
        const photoData: PhotoInsert = {
          inspection_id: inspectionId,
          file_name: file.name,
          storage_path: storagePath,
          category: category,
          location: location || null,
        };

        const { data: photo, error: dbError } = (await supabase
          .from("photos")
          .insert(photoData as never)
          .select()
          .single()) as { data: Photo | null; error: Error | null };

        if (dbError || !photo) {
          console.error("Database insert error:", dbError);
          // Try to clean up the uploaded file
          await supabase.storage
            .from("inspection-photos")
            .remove([storagePath]);
          throw new Error(
            `Failed to save photo record: ${dbError?.message || "Unknown error"}`
          );
        }

        // Get signed URL for the photo (valid for 1 hour)
        const { data: urlData } = await supabase.storage
          .from("inspection-photos")
          .createSignedUrl(storagePath, 3600);

        return {
          id: photo.id,
          inspectionId: photo.inspection_id,
          fileName: photo.file_name,
          storagePath: photo.storage_path,
          originalUrl: urlData?.signedUrl || null,
          thumbnailUrl: null,
          category: photo.category?.toUpperCase() || "OTHER",
          location: photo.location,
          width: photo.width,
          height: photo.height,
          aiCaption: photo.ai_caption,
          aiObjects: photo.ai_objects,
          aiCondition: photo.ai_condition,
          aiConfidence: photo.ai_confidence,
          processedAt: photo.processed_at,
          createdAt: photo.created_at,
        };
      })
    );

    return NextResponse.json(
      {
        photos: uploadedPhotos,
        message: `Successfully uploaded ${uploadedPhotos.length} photo${uploadedPhotos.length !== 1 ? "s" : ""}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading photos:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload photos",
      },
      { status: 500 }
    );
  }
}
