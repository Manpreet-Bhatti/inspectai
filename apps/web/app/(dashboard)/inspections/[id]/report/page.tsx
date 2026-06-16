"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Download,
  Loader2,
  CheckCircle,
  DollarSign,
} from "lucide-react";
import { useInspection } from "@/hooks/useInspections";
import { useFindings } from "@/hooks/useFindings";
import { useGenerateReport, triggerPdfDownload } from "@/hooks/useReports";
import { api } from "@/lib/api";
import { ReportPreview } from "@/components/report/ReportPreview";
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

  const totalCost = findings.reduce((s, f) => s + (f.costEstimate ?? 0), 0);

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

          <ReportPreview inspection={inspection} findings={findings} />
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
