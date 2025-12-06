import { NextRequest, NextResponse } from "next/server";

// TODO: Import S3 utilities for presigned URLs
// import { getPresignedUrl } from "@/lib/s3";

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

    // TODO: Fetch report from database and generate presigned URL
    // const report = await prisma.report.findUnique({ where: { id } });
    // const downloadUrl = await getPresignedUrl(report.fileUrl);

    const downloadInfo = {
      reportId: id,
      downloadUrl: `/reports/${id}.pdf`,
      expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      fileName: `inspection-report-${id}.pdf`,
    };

    return NextResponse.json(downloadInfo);
  } catch (error) {
    console.error("Error getting download URL:", error);
    return NextResponse.json(
      { error: "Failed to get download URL" },
      { status: 500 }
    );
  }
}
