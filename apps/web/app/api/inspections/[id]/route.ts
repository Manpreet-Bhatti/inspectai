import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database, Tables, TablesUpdate } from "@/types/database";

type Inspection = Tables<"inspections">;
type InspectionUpdate = TablesUpdate<"inspections">;
type InspectionStatus = Database["public"]["Enums"]["inspection_status"];
type PropertyType = Database["public"]["Enums"]["property_type"];

/**
 * GET /api/inspections/[id]
 * Get a single inspection by ID
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

    // Fetch inspection
    const { data: inspection, error } = (await supabase
      .from("inspections")
      .select("*")
      .eq("id", id)
      .single()) as { data: Inspection | null; error: Error | null };

    if (error || !inspection) {
      return NextResponse.json(
        { error: "Inspection not found" },
        { status: 404 }
      );
    }

    // Verify user owns this inspection
    if (inspection.user_id !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to view this inspection" },
        { status: 403 }
      );
    }

    // Get counts for related entities
    const [photosCount, findingsCount, voiceNotesCount] = await Promise.all([
      supabase
        .from("photos")
        .select("*", { count: "exact", head: true })
        .eq("inspection_id", id),
      supabase
        .from("findings")
        .select("*", { count: "exact", head: true })
        .eq("inspection_id", id),
      supabase
        .from("voice_notes")
        .select("*", { count: "exact", head: true })
        .eq("inspection_id", id),
    ]);

    // Transform to camelCase for API response
    const response = {
      id: inspection.id,
      title: inspection.title,
      address: inspection.address,
      city: inspection.city,
      state: inspection.state,
      zipCode: inspection.zip_code,
      propertyType: inspection.property_type,
      status: inspection.status,
      userId: inspection.user_id,
      scheduledAt: inspection.scheduled_at,
      completedAt: inspection.completed_at,
      metadata: inspection.metadata,
      createdAt: inspection.created_at,
      updatedAt: inspection.updated_at,
      _count: {
        photos: photosCount.count || 0,
        findings: findingsCount.count || 0,
        voiceNotes: voiceNotesCount.count || 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching inspection:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspection" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/inspections/[id]
 * Update an inspection
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

    // Verify user owns this inspection
    const { data: existing, error: fetchError } = (await supabase
      .from("inspections")
      .select("id, user_id")
      .eq("id", id)
      .single()) as {
      data: Pick<Inspection, "id" | "user_id"> | null;
      error: Error | null;
    };

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Inspection not found" },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to update this inspection" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Build update object (only include provided fields)
    const updateData: InspectionUpdate = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.state !== undefined) updateData.state = body.state;
    if (body.zipCode !== undefined) updateData.zip_code = body.zipCode;
    if (body.propertyType !== undefined) {
      updateData.property_type =
        body.propertyType.toLowerCase() as PropertyType;
    }
    if (body.status !== undefined) {
      updateData.status = body.status.toLowerCase() as InspectionStatus;
    }
    if (body.scheduledAt !== undefined)
      updateData.scheduled_at = body.scheduledAt;
    if (body.completedAt !== undefined)
      updateData.completed_at = body.completedAt;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    const { data: inspection, error } = (await supabase
      .from("inspections")
      .update(updateData as never)
      .eq("id", id)
      .select()
      .single()) as { data: Inspection | null; error: Error | null };

    if (error || !inspection) {
      console.error("Error updating inspection:", error);
      return NextResponse.json(
        { error: "Failed to update inspection" },
        { status: 500 }
      );
    }

    // Transform to camelCase for API response
    const response = {
      id: inspection.id,
      title: inspection.title,
      address: inspection.address,
      city: inspection.city,
      state: inspection.state,
      zipCode: inspection.zip_code,
      propertyType: inspection.property_type,
      status: inspection.status,
      userId: inspection.user_id,
      scheduledAt: inspection.scheduled_at,
      completedAt: inspection.completed_at,
      metadata: inspection.metadata,
      createdAt: inspection.created_at,
      updatedAt: inspection.updated_at,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating inspection:", error);
    return NextResponse.json(
      { error: "Failed to update inspection" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/inspections/[id]
 * Delete an inspection
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

    // Verify user owns this inspection
    const { data: existing, error: fetchError } = (await supabase
      .from("inspections")
      .select("id, user_id")
      .eq("id", id)
      .single()) as {
      data: Pick<Inspection, "id" | "user_id"> | null;
      error: Error | null;
    };

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: "Inspection not found" },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to delete this inspection" },
        { status: 403 }
      );
    }

    // Delete associated photos from storage first
    const { data: photos } = (await supabase
      .from("photos")
      .select("storage_path")
      .eq("inspection_id", id)) as { data: { storage_path: string }[] | null };

    if (photos && photos.length > 0) {
      const paths = photos.map((p) => p.storage_path);
      await supabase.storage.from("inspection-photos").remove(paths);
    }

    // Delete associated voice notes from storage
    const { data: voiceNotes } = (await supabase
      .from("voice_notes")
      .select("storage_path")
      .eq("inspection_id", id)) as { data: { storage_path: string }[] | null };

    if (voiceNotes && voiceNotes.length > 0) {
      const paths = voiceNotes.map((v) => v.storage_path);
      await supabase.storage.from("voice-notes").remove(paths);
    }

    // Delete the inspection (cascades to related records)
    const { error } = await supabase.from("inspections").delete().eq("id", id);

    if (error) {
      console.error("Error deleting inspection:", error);
      return NextResponse.json(
        { error: "Failed to delete inspection" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting inspection:", error);
    return NextResponse.json(
      { error: "Failed to delete inspection" },
      { status: 500 }
    );
  }
}
