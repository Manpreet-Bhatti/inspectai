import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Database, Tables, TablesInsert } from "@/types/database";

type Report = Tables<"reports">;
type ReportInsert = TablesInsert<"reports">;
type Inspection = Tables<"inspections">;
type Finding = Tables<"findings">;
type ReportType = Database["public"]["Enums"]["report_type"];

/**
 * POST /api/reports
 * Generate a report for an inspection
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
    const { inspectionId, type = "full" } = body;

    if (!inspectionId) {
      return NextResponse.json(
        { error: "Missing inspectionId" },
        { status: 400 }
      );
    }

    const validTypes: ReportType[] = ["full", "summary", "defects"];
    const reportType = type.toLowerCase() as ReportType;
    if (!validTypes.includes(reportType)) {
      return NextResponse.json(
        { error: "Invalid report type. Must be: full, summary, or defects" },
        { status: 400 }
      );
    }

    // Verify the user owns this inspection
    const { data: inspection, error: inspectionError } = (await supabase
      .from("inspections")
      .select("*")
      .eq("id", inspectionId)
      .single()) as { data: Inspection | null; error: Error | null };

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
            "You do not have permission to generate reports for this inspection",
        },
        { status: 403 }
      );
    }

    // Get findings for this inspection to calculate total cost
    const { data: findings } = (await supabase
      .from("findings")
      .select("cost_estimate, severity, title")
      .eq("inspection_id", inspectionId)) as {
      data: Pick<Finding, "cost_estimate" | "severity" | "title">[] | null;
    };

    const totalCost = (findings || []).reduce(
      (sum, f) => sum + (f.cost_estimate || 0),
      0
    );

    const findingsCount = findings?.length || 0;

    // Generate summary based on findings
    let summary = `Property inspection for ${inspection.address}, ${inspection.city}, ${inspection.state} ${inspection.zip_code}.`;
    if (findingsCount > 0) {
      summary += ` ${findingsCount} finding${findingsCount !== 1 ? "s" : ""} identified.`;
      if (totalCost > 0) {
        summary += ` Total estimated repair cost: $${totalCost.toLocaleString()}.`;
      }
    } else {
      summary += " No significant findings identified.";
    }

    // Create report record in database
    // Note: In a full implementation, you would generate a PDF here and upload to storage
    const reportData: ReportInsert = {
      inspection_id: inspectionId,
      type: reportType,
      summary: summary,
      total_cost: totalCost,
      storage_path: null, // Would be set after PDF generation
    };

    const { data: report, error: dbError } = (await supabase
      .from("reports")
      .insert(reportData as never)
      .select()
      .single()) as { data: Report | null; error: Error | null };

    if (dbError || !report) {
      console.error("Error creating report:", dbError);
      return NextResponse.json(
        { error: "Failed to create report" },
        { status: 500 }
      );
    }

    // Transform to camelCase for API response
    const response = {
      id: report.id,
      inspectionId: report.inspection_id,
      type: report.type,
      storagePath: report.storage_path,
      summary: report.summary,
      totalCost: report.total_cost,
      generatedAt: report.generated_at,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
