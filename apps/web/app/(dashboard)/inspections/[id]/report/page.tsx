"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Download,
  Loader2,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Building2,
  MapPin,
  Calendar,
} from "lucide-react";
import { useInspection } from "@/hooks/useInspections";
import { useFindings } from "@/hooks/useFindings";
import { useGenerateReport, triggerPdfDownload } from "@/hooks/useReports";
import { api } from "@/lib/api";
import type { ReportType } from "@/types";

const reportTypes: { id: ReportType; label: string; description: string }[] = [
  {
    id: "FULL",
    label: "Full Report",
    description:
      "Comprehensive report with all findings, photos, and recommendations",
  },
  {
    id: "SUMMARY",
    label: "Summary Report",
    description: "Executive summary with key findings and cost estimates",
  },
  {
    id: "DEFECTS",
    label: "Defects Only",
    description: "Report focusing only on critical, major, and minor issues",
  },
];

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "text-red-600 dark:text-red-400",
  MAJOR: "text-orange-600 dark:text-orange-400",
  MINOR: "text-yellow-600 dark:text-yellow-400",
  COSMETIC: "text-blue-600 dark:text-blue-400",
  INFO: "text-gray-500",
};

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [selectedType, setSelectedType] = useState<ReportType>("FULL");
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(
    null
  );
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: inspection, isLoading: inspectionLoading } = useInspection(id);
  const { data: findingsData, isLoading: findingsLoading } = useFindings(id);
  const generateReport = useGenerateReport();

  const findings = findingsData?.data ?? [];
  const isLoading = inspectionLoading || findingsLoading;

  const critical = findings.filter((f) => f.severity === "CRITICAL").length;
  const major = findings.filter((f) => f.severity === "MAJOR").length;
  const minor = findings.filter((f) => f.severity === "MINOR").length;
  const cosmetic = findings.filter((f) => f.severity === "COSMETIC").length;
  const totalCost = findings.reduce((s, f) => s + (f.costEstimate ?? 0), 0);

  const topFindings = [...findings]
    .filter((f) => ["CRITICAL", "MAJOR"].includes(f.severity))
    .sort((a, b) => {
      const order = { CRITICAL: 0, MAJOR: 1, MINOR: 2, COSMETIC: 3, INFO: 4 };
      return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
    })
    .slice(0, 5);

  async function handleGenerate() {
    const result = await generateReport.mutateAsync({
      inspectionId: id,
      type: selectedType,
    });
    setGeneratedReportId(result.id);
  }

  async function handleDownload() {
    if (!generatedReportId) return;
    setIsDownloading(true);
    try {
      const data = await api.get<{ downloadUrl: string; fileName: string }>(
        `/reports/${generatedReportId}/download`
      );
      triggerPdfDownload(data.downloadUrl, data.fileName);
    } finally {
      setIsDownloading(false);
    }
  }

  const isGenerated = !!generatedReportId;
  const isGenerating = generateReport.isPending;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="text-muted-foreground py-16 text-center">
        Inspection not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/inspections/${id}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to inspection
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Generate Report
          </h1>
          <p className="text-muted-foreground">
            Create a professional inspection report to share with clients.
          </p>
        </div>
        {isGenerated && (
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PDF
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Report Type */}
          <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
            <h2 className="text-foreground mb-4 text-lg font-semibold">
              Report Type
            </h2>
            <div className="space-y-3">
              {reportTypes.map((type) => (
                <label
                  key={type.id}
                  className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors ${
                    selectedType === type.id
                      ? "border-primary bg-primary/5"
                      : "border-input hover:border-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    value={type.id}
                    checked={selectedType === type.id}
                    onChange={(e) =>
                      setSelectedType(e.target.value as ReportType)
                    }
                    className="border-input text-primary focus:ring-primary mt-1 h-4 w-4"
                  />
                  <div>
                    <p className="text-foreground font-medium">{type.label}</p>
                    <p className="text-muted-foreground text-sm">
                      {type.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Report Preview */}
          <div className="border-border bg-card rounded-xl border shadow-sm">
            <div className="border-border border-b px-6 py-4">
              <h2 className="text-foreground text-lg font-semibold">
                Report Preview
              </h2>
            </div>
            <div className="p-6">
              {/* Preview Header */}
              <div className="bg-muted/50 mb-6 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-lg">
                    <span className="text-primary-foreground text-lg font-bold">
                      AI
                    </span>
                  </div>
                  <div>
                    <h3 className="text-foreground text-xl font-bold">
                      Property Inspection Report
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Generated by InspectAI
                    </p>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="mb-6">
                <h4 className="text-foreground mb-3 font-semibold">
                  Property Details
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">Property:</span>
                    <span className="text-foreground font-medium">
                      {inspection.propertyType
                        ?.replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">Date:</span>
                    <span className="text-foreground font-medium">
                      {new Date(inspection.createdAt).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-sm">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">Address:</span>
                    <span className="text-foreground font-medium">
                      {inspection.address}, {inspection.city},{" "}
                      {inspection.state} {inspection.zipCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="mb-6">
                <h4 className="text-foreground mb-3 font-semibold">
                  Inspection Summary
                </h4>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="rounded-lg bg-red-500/10 p-3 text-center">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {critical}
                    </p>
                    <p className="text-muted-foreground text-xs">Critical</p>
                  </div>
                  <div className="rounded-lg bg-orange-500/10 p-3 text-center">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {major}
                    </p>
                    <p className="text-muted-foreground text-xs">Major</p>
                  </div>
                  <div className="rounded-lg bg-yellow-500/10 p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {minor}
                    </p>
                    <p className="text-muted-foreground text-xs">Minor</p>
                  </div>
                  <div className="rounded-lg bg-blue-500/10 p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {cosmetic}
                    </p>
                    <p className="text-muted-foreground text-xs">Cosmetic</p>
                  </div>
                </div>
              </div>

              {/* Top Findings */}
              {topFindings.length > 0 && (
                <div>
                  <h4 className="text-foreground mb-3 font-semibold">
                    Key Findings
                  </h4>
                  <div className="space-y-2">
                    {topFindings.map((finding) => (
                      <div
                        key={finding.id}
                        className="border-border flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <AlertTriangle
                            className={`h-4 w-4 ${SEVERITY_COLORS[finding.severity] ?? "text-gray-500"}`}
                          />
                          <span className="text-foreground text-sm font-medium">
                            {finding.title}
                          </span>
                        </div>
                        {finding.costEstimate ? (
                          <span className="text-foreground text-sm font-semibold">
                            ${finding.costEstimate.toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {findings.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No findings recorded for this inspection yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cost Summary */}
          {totalCost > 0 && (
            <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
              <h3 className="text-foreground mb-4 font-semibold">
                Cost Summary
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-foreground text-2xl font-bold">
                    ${totalCost.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Total estimated repairs
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
            <h3 className="text-foreground mb-4 font-semibold">
              Generate Report
            </h3>

            {generateReport.isError && (
              <p className="text-destructive mb-3 text-sm">
                Failed to generate report. Please try again.
              </p>
            )}

            {isGenerated ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Report ready!</span>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download PDF
                </button>
                <button
                  onClick={() => setGeneratedReportId(null)}
                  className="border-input bg-background text-foreground hover:bg-muted flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium"
                >
                  Generate New Report
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Generate Report
                  </>
                )}
              </button>
            )}
          </div>

          {/* Report Info */}
          <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
            <h3 className="text-foreground mb-4 font-semibold">Report Info</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Photos analyzed</dt>
                <dd className="text-foreground font-medium">
                  {inspection._count?.photos ?? 0}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total findings</dt>
                <dd className="text-foreground font-medium">
                  {findings.length}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Voice notes</dt>
                <dd className="text-foreground font-medium">
                  {inspection._count?.voiceNotes ?? 0}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
