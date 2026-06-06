import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findSimilarFindings } from "@/lib/ml-client";
import type { Tables } from "@/types/database";

type Finding = Tables<"findings">;

/**
 * GET /api/findings/[id]/similar
 * Find similar findings using pgvector similarity search via the ML service.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "5"), 20);
    const threshold = parseFloat(searchParams.get("threshold") || "0.7");

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the source finding to build query text
    const { data: finding, error: findingError } = (await supabase
      .from("findings")
      .select("id, title, description, inspection_id")
      .eq("id", id)
      .single()) as {
      data: Pick<Finding, "id" | "title" | "description" | "inspection_id"> | null;
      error: Error | null;
    };

    if (findingError || !finding) {
      return NextResponse.json({ error: "Finding not found" }, { status: 404 });
    }

    // Verify the user owns the inspection
    const { data: inspection, error: inspectionError } = await supabase
      .from("inspections")
      .select("user_id")
      .eq("id", finding.inspection_id)
      .single() as { data: { user_id: string } | null; error: Error | null };

    if (inspectionError || !inspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
    }

    if (inspection.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const queryText = `${finding.title}. ${finding.description}`;
    const result = await findSimilarFindings(queryText, limit, threshold);

    // Exclude the source finding from results
    const similar = result.findings
      .filter((f) => f.id !== id)
      .map((f) => ({
        id: f.id,
        inspectionId: f.inspection_id,
        title: f.title,
        description: f.description,
        category: f.category,
        severity: f.severity,
        costEstimate: f.cost_estimate,
        similarity: f.similarity,
      }));

    return NextResponse.json({ findingId: id, similar });
  } catch (error) {
    console.error("Error finding similar findings:", error);
    return NextResponse.json(
      { error: "Failed to find similar findings" },
      { status: 500 }
    );
  }
}
