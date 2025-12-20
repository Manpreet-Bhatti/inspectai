import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database, Tables, TablesInsert } from "@/types/database";

type Finding = Tables<"findings">;
type FindingInsert = TablesInsert<"findings">;
type Inspection = Tables<"inspections">;
type FindingCategory = Database["public"]["Enums"]["finding_category"];
type Severity = Database["public"]["Enums"]["severity"];

/**
 * GET /api/findings
 * List findings with filters
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
    const inspectionId = searchParams.get("inspectionId");
    const severity = searchParams.get("severity") as Severity | null;
    const category = searchParams.get("category") as FindingCategory | null;

    if (!inspectionId) {
      return NextResponse.json(
        { error: "Missing inspectionId parameter" },
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
        { error: "You do not have permission to view this inspection" },
        { status: 403 }
      );
    }

    // Build query
    let query = supabase
      .from("findings")
      .select("*")
      .eq("inspection_id", inspectionId)
      .order("created_at", { ascending: false });

    if (severity) {
      query = query.eq("severity", severity);
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data: findings, error } = await query;

    if (error) {
      console.error("Error fetching findings:", error);
      return NextResponse.json(
        { error: "Failed to fetch findings" },
        { status: 500 }
      );
    }

    // Transform to camelCase for API response
    const data = (findings || []).map((finding: Finding) => ({
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
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching findings:", error);
    return NextResponse.json(
      { error: "Failed to fetch findings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/findings
 * Create a new finding
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
      "inspectionId",
      "title",
      "description",
      "category",
      "severity",
    ];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Verify the user owns this inspection
    const { data: inspection, error: inspectionError } = (await supabase
      .from("inspections")
      .select("id, user_id")
      .eq("id", body.inspectionId)
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
        {
          error:
            "You do not have permission to add findings to this inspection",
        },
        { status: 403 }
      );
    }

    // Create finding
    const findingData: FindingInsert = {
      inspection_id: body.inspectionId,
      title: body.title,
      description: body.description,
      category: body.category.toLowerCase() as FindingCategory,
      severity: body.severity.toLowerCase() as Severity,
      location: body.location || null,
      cost_estimate: body.costEstimate || null,
      cost_min: body.costMin || null,
      cost_max: body.costMax || null,
      status: "active",
      is_ai_generated: body.isAiGenerated || false,
      confidence: body.confidence || null,
      photo_id: body.photoId || null,
      voice_note_id: body.voiceNoteId || null,
    };

    const { data: finding, error } = (await supabase
      .from("findings")
      .insert(findingData as never)
      .select()
      .single()) as { data: Finding | null; error: Error | null };

    if (error || !finding) {
      console.error("Error creating finding:", error);
      return NextResponse.json(
        { error: "Failed to create finding" },
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

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating finding:", error);
    return NextResponse.json(
      { error: "Failed to create finding" },
      { status: 500 }
    );
  }
}
