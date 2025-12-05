"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Download,
  Eye,
  Send,
  Loader2,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Building2,
  MapPin,
  Calendar,
} from "lucide-react";

const reportData = {
  inspection: {
    title: "123 Oak Street Inspection",
    address: "123 Oak Street, Springfield, IL 62701",
    propertyType: "Single Family",
    date: "January 15, 2024",
    inspector: "John Inspector",
  },
  summary: {
    totalFindings: 8,
    critical: 1,
    major: 2,
    minor: 3,
    cosmetic: 2,
    totalCost: 14530,
    photosAnalyzed: 45,
  },
  findings: [
    {
      id: "1",
      title: "Outdated electrical panel",
      severity: "CRITICAL",
      cost: 3500,
    },
    {
      id: "2",
      title: "Water damage on ceiling",
      severity: "MAJOR",
      cost: 2500,
    },
    {
      id: "3",
      title: "Roof shingles showing wear",
      severity: "MAJOR",
      cost: 8000,
    },
  ],
};

const reportTypes = [
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
    description: "Report focusing only on identified issues and repairs needed",
  },
];

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [selectedType, setSelectedType] = useState("FULL");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsGenerating(false);
    setIsGenerated(true);
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href={`/inspections/${id}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to inspection
      </Link>

      {/* Page Header */}
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
          <div className="flex gap-2">
            <button className="border-input bg-background text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium">
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold">
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Report Configuration */}
        <div className="space-y-6 lg:col-span-2">
          {/* Report Type Selection */}
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
                    onChange={(e) => setSelectedType(e.target.value)}
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
                      {reportData.inspection.propertyType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">Date:</span>
                    <span className="text-foreground font-medium">
                      {reportData.inspection.date}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-sm">
                    <MapPin className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground">Address:</span>
                    <span className="text-foreground font-medium">
                      {reportData.inspection.address}
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
                      {reportData.summary.critical}
                    </p>
                    <p className="text-muted-foreground text-xs">Critical</p>
                  </div>
                  <div className="rounded-lg bg-orange-500/10 p-3 text-center">
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {reportData.summary.major}
                    </p>
                    <p className="text-muted-foreground text-xs">Major</p>
                  </div>
                  <div className="rounded-lg bg-yellow-500/10 p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {reportData.summary.minor}
                    </p>
                    <p className="text-muted-foreground text-xs">Minor</p>
                  </div>
                  <div className="rounded-lg bg-blue-500/10 p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {reportData.summary.cosmetic}
                    </p>
                    <p className="text-muted-foreground text-xs">Cosmetic</p>
                  </div>
                </div>
              </div>

              {/* Top Findings */}
              <div>
                <h4 className="text-foreground mb-3 font-semibold">
                  Key Findings
                </h4>
                <div className="space-y-2">
                  {reportData.findings.map((finding) => (
                    <div
                      key={finding.id}
                      className="border-border flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            finding.severity === "CRITICAL"
                              ? "text-red-500"
                              : "text-orange-500"
                          }`}
                        />
                        <span className="text-foreground text-sm font-medium">
                          {finding.title}
                        </span>
                      </div>
                      <span className="text-foreground text-sm font-semibold">
                        ${finding.cost.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cost Summary */}
          <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
            <h3 className="text-foreground mb-4 font-semibold">Cost Summary</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-foreground text-2xl font-bold">
                  ${reportData.summary.totalCost.toLocaleString()}
                </p>
                <p className="text-muted-foreground text-sm">
                  Total estimated repairs
                </p>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
            <h3 className="text-foreground mb-4 font-semibold">
              Generate Report
            </h3>

            {isGenerated ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Report ready!</span>
                </div>
                <div className="space-y-2">
                  <button className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>
                  <button className="border-input bg-background text-foreground hover:bg-muted flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium">
                    <Send className="h-4 w-4" />
                    Email Report
                  </button>
                </div>
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
                    Generating...
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
                  {reportData.summary.photosAnalyzed}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total findings</dt>
                <dd className="text-foreground font-medium">
                  {reportData.summary.totalFindings}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Inspector</dt>
                <dd className="text-foreground font-medium">
                  {reportData.inspection.inspector}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
