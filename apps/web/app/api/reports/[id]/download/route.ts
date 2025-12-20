import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

type Report = Tables<"reports">;
type Inspection = Tables<"inspections">;

/**
 * GET /api/reports/[id]/download
 * Get download URL for a report
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

    // Fetch report
    const { data: report, error } = (await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .single()) as { data: Report | null; error: Error | null };

    if (error || !report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Verify user owns the inspection this report belongs to
    const { data: inspection, error: inspectionError } = (await supabase
      .from("inspections")
      .select("id, user_id")
      .eq("id", report.inspection_id)
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
        { error: "You do not have permission to download this report" },
        { status: 403 }
      );
    }

    // Check if report has a file
    if (!report.storage_path) {
      return NextResponse.json(
        { error: "Report file not yet generated" },
        { status: 404 }
      );
    }

    // Get signed URL for the report (valid for 1 hour)
    const { data: urlData, error: urlError } = await supabase.storage
      .from("reports")
      .createSignedUrl(report.storage_path, 3600);

    if (urlError || !urlData?.signedUrl) {
      console.error("Error generating download URL:", urlError);
      return NextResponse.json(
        { error: "Failed to generate download URL" },
        { status: 500 }
      );
    }

    // Transform to camelCase for API response
    const response = {
      reportId: report.id,
      downloadUrl: urlData.signedUrl,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      fileName: `inspection-report-${report.id}.pdf`,
      type: report.type,
      summary: report.summary,
      totalCost: report.total_cost,
      generatedAt: report.generated_at,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error getting download URL:", error);
    return NextResponse.json(
      { error: "Failed to get download URL" },
      { status: 500 }
    );
  }
}
