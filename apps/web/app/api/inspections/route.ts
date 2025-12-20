import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database, Tables, TablesInsert } from "@/types/database";

type Inspection = Tables<"inspections">;
type InspectionInsert = TablesInsert<"inspections">;
type InspectionStatus = Database["public"]["Enums"]["inspection_status"];
type PropertyType = Database["public"]["Enums"]["property_type"];

/**
 * GET /api/inspections
 * List inspections with pagination and filters
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") as InspectionStatus | null;
    const propertyType = searchParams.get(
      "propertyType"
    ) as PropertyType | null;

    // Build query
    let query = supabase
      .from("inspections")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (propertyType) {
      query = query.eq("property_type", propertyType);
    }

    // Apply pagination
    const start = (page - 1) * limit;
    query = query.range(start, start + limit - 1);

    const { data: inspections, error, count } = await query;

    if (error) {
      console.error("Error fetching inspections:", error);
      return NextResponse.json(
        { error: "Failed to fetch inspections" },
        { status: 500 }
      );
    }

    // Transform to camelCase for API response
    const data = (inspections || []).map((inspection: Inspection) => ({
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
    }));

    return NextResponse.json({
      data,
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching inspections:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspections" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inspections
 * Create a new inspection
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

    const body = await request.json();

    // Validate required fields
    const required = [
      "title",
      "address",
      "city",
      "state",
      "zipCode",
      "propertyType",
    ];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create inspection
    const inspectionData: InspectionInsert = {
      title: body.title,
      address: body.address,
      city: body.city,
      state: body.state,
      zip_code: body.zipCode,
      property_type: body.propertyType.toLowerCase() as PropertyType,
      status: "draft",
      user_id: user.id,
      scheduled_at: body.scheduledAt || null,
      metadata: body.metadata || null,
    };

    const { data: inspection, error } = (await supabase
      .from("inspections")
      .insert(inspectionData as never)
      .select()
      .single()) as { data: Inspection | null; error: Error | null };

    if (error || !inspection) {
      console.error("Error creating inspection:", error);
      return NextResponse.json(
        { error: "Failed to create inspection" },
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

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating inspection:", error);
    return NextResponse.json(
      { error: "Failed to create inspection" },
      { status: 500 }
    );
  }
}
