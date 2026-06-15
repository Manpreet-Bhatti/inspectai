import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderReport } from "@/components/report/ReportDocument";
import type { Database, Tables, TablesInsert } from "@/types/database";
import type { Finding as AppFinding } from "@/types";

type Report = Tables<"reports">;
type ReportInsert = TablesInsert<"reports">;
type Inspection = Tables<"inspections">;
type DbFinding = Tables<"findings">;
type ReportType = Database["public"]["Enums"]["report_type"];

/**
 * POST /api/reports
 * Generate a PDF report for an inspection, upload to storage, persist metadata.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

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

    const { data: findings } = (await supabase
      .from("findings")
      .select(
        "title, description, category, severity, location, cost_estimate, cost_min, cost_max, status"
      )
      .eq("inspection_id", inspectionId)
      .order("severity", { ascending: true })) as {
      data:
        | Pick<
            DbFinding,
            | "title"
            | "description"
            | "category"
            | "severity"
            | "location"
            | "cost_estimate"
            | "cost_min"
            | "cost_max"
            | "status"
          >[]
        | null;
    };

    const allFindings = findings ?? [];
    const totalCost = allFindings.reduce(
      (sum, f) => sum + (f.cost_estimate ?? 0),
      0
    );
    const findingsCount = allFindings.length;

    let summary = `Property inspection for ${inspection.address}, ${inspection.city}, ${inspection.state} ${inspection.zip_code}.`;
    if (findingsCount > 0) {
      const critical = allFindings.filter(
        (f) => f.severity === "critical"
      ).length;
      const major = allFindings.filter((f) => f.severity === "major").length;
      summary += ` ${findingsCount} finding${findingsCount !== 1 ? "s" : ""} identified`;
      if (critical > 0)
        summary += ` including ${critical} critical issue${critical !== 1 ? "s" : ""}`;
      if (major > 0)
        summary += ` and ${major} major issue${major !== 1 ? "s" : ""}`;
      summary += ".";
      if (totalCost > 0) {
        summary += ` Total estimated repair cost: $${totalCost.toLocaleString()}.`;
      }
    } else {
      summary += " No significant findings identified.";
    }

    // Normalize findings: DB uses lowercase enums; ReportData expects uppercase app types
    const normalizedFindings = allFindings.map((f) => ({
      title: f.title,
      description: f.description,
      category: (f.category ?? "other").toUpperCase() as AppFinding["category"],
      severity: (f.severity ?? "info").toUpperCase() as AppFinding["severity"],
      location: f.location,
      costEstimate: f.cost_estimate,
      costMin: f.cost_min,
      costMax: f.cost_max,
      status: (f.status ?? "active").toUpperCase() as AppFinding["status"],
    }));

    // Create report record first to get ID for storage path
    const reportData: ReportInsert = {
      inspection_id: inspectionId,
      type: reportType,
      summary,
      total_cost: totalCost,
      storage_path: null,
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

    // Generate PDF
    const pdfBuffer = await renderReport({
      inspectionId,
      title: inspection.title,
      address: inspection.address,
      city: inspection.city,
      state: inspection.state,
      zipCode: inspection.zip_code,
      propertyType: inspection.property_type,
      createdAt: inspection.created_at ?? new Date().toISOString(),
      inspectorEmail: user.email ?? "Inspector",
      findings: normalizedFindings,
      reportType,
      totalCost,
      summary,
    });

    // Upload PDF to Supabase Storage
    const storagePath = `${user.id}/${inspectionId}/${report.id}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("reports")
      .upload(storagePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading PDF:", uploadError);
      // Return the report without storage_path; download route will handle missing file
      return NextResponse.json(
        { error: "PDF generated but upload failed" },
        { status: 500 }
      );
    }

    // Update report record with storage path
    const { data: updatedReport } = (await supabase
      .from("reports")
      .update({ storage_path: storagePath } as never)
      .eq("id", report.id)
      .select()
      .single()) as { data: Report | null };

    const finalReport = updatedReport ?? report;

    return NextResponse.json(
      {
        id: finalReport.id,
        inspectionId: finalReport.inspection_id,
        type: finalReport.type,
        storagePath: storagePath,
        summary: finalReport.summary,
        totalCost: finalReport.total_cost,
        generatedAt: finalReport.generated_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
