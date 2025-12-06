"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Filter,
  Search,
  AlertTriangle,
  DollarSign,
  MapPin,
  Camera,
  Sparkles,
  MoreVertical,
} from "lucide-react";

const findings = [
  {
    id: "1",
    title: "Water damage on ceiling",
    description:
      "Visible water staining and discoloration on living room ceiling, approximately 3 feet in diameter. Indicates possible roof leak or plumbing issue above.",
    category: "STRUCTURAL",
    severity: "MAJOR",
    location: "Living Room",
    costEstimate: 2500,
    costMin: 1500,
    costMax: 4000,
    isAiGenerated: true,
    confidence: 0.92,
    photoId: "3",
  },
  {
    id: "2",
    title: "Outdated electrical panel",
    description:
      "Federal Pacific Stab-Lok electrical panel identified. These panels are known fire hazards and should be replaced immediately.",
    category: "ELECTRICAL",
    severity: "CRITICAL",
    location: "Basement",
    costEstimate: 3500,
    costMin: 2500,
    costMax: 5000,
    isAiGenerated: true,
    confidence: 0.95,
    photoId: "4",
  },
  {
    id: "3",
    title: "Minor crack in foundation",
    description:
      "Hairline crack observed in concrete foundation wall. Does not appear to be structural but should be monitored for changes.",
    category: "STRUCTURAL",
    severity: "MINOR",
    location: "Foundation - Southeast Corner",
    costEstimate: 500,
    costMin: 200,
    costMax: 800,
    isAiGenerated: true,
    confidence: 0.88,
    photoId: "5",
  },
  {
    id: "4",
    title: "HVAC filter replacement needed",
    description:
      "Air filter is dirty and should be replaced. Recommend replacing every 1-3 months for optimal performance.",
    category: "HVAC",
    severity: "COSMETIC",
    location: "Utility Room",
    costEstimate: 30,
    costMin: 20,
    costMax: 50,
    isAiGenerated: false,
    confidence: null,
    photoId: "6",
  },
  {
    id: "5",
    title: "Roof shingles showing wear",
    description:
      "Asphalt shingles on north side of roof showing signs of weathering and granule loss. May need replacement within 3-5 years.",
    category: "ROOFING",
    severity: "INFO",
    location: "Roof - North Side",
    costEstimate: 8000,
    costMin: 5000,
    costMax: 12000,
    isAiGenerated: true,
    confidence: 0.87,
    photoId: "2",
  },
];

const categories = [
  "All",
  "STRUCTURAL",
  "ELECTRICAL",
  "PLUMBING",
  "HVAC",
  "ROOFING",
  "EXTERIOR",
  "INTERIOR",
  "SAFETY",
  "COSMETIC",
];

const severities = ["All", "CRITICAL", "MAJOR", "MINOR", "COSMETIC", "INFO"];

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertTriangle className="h-3 w-3" />
          Critical
        </span>
      );
    case "MAJOR":
      return (
        <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-400">
          Major
        </span>
      );
    case "MINOR":
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
          Minor
        </span>
      );
    case "COSMETIC":
      return (
        <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
          Cosmetic
        </span>
      );
    default:
      return (
        <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
          Info
        </span>
      );
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function FindingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSeverity, setSelectedSeverity] = useState("All");

  const filteredFindings = findings.filter((f) => {
    if (selectedCategory !== "All" && f.category !== selectedCategory)
      return false;
    if (selectedSeverity !== "All" && f.severity !== selectedSeverity)
      return false;
    return true;
  });

  const totalEstimatedCost = filteredFindings.reduce(
    (sum, f) => sum + f.costEstimate,
    0
  );

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
            Findings
          </h1>
          <p className="text-muted-foreground">
            {filteredFindings.length} findings · Total estimated cost:{" "}
            {formatCurrency(totalEstimatedCost)}
          </p>
        </div>
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors">
          <Plus className="h-4 w-4" />
          Add Finding
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search findings..."
            className="border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary w-full rounded-lg border py-2 pl-10 pr-4 focus:outline-none focus:ring-1"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border-input bg-background text-foreground focus:border-primary focus:ring-primary rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="border-input bg-background text-foreground focus:border-primary focus:ring-primary rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1"
          >
            {severities.map((sev) => (
              <option key={sev} value={sev}>
                {sev === "All" ? "All Severities" : sev}
              </option>
            ))}
          </select>
          <button className="border-input bg-background text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <Filter className="h-4 w-4" />
            More
          </button>
        </div>
      </div>

      {/* Severity Summary */}
      <div className="grid gap-4 sm:grid-cols-5">
        {["CRITICAL", "MAJOR", "MINOR", "COSMETIC", "INFO"].map((severity) => {
          const count = findings.filter((f) => f.severity === severity).length;
          const colors: Record<string, string> = {
            CRITICAL: "bg-red-500/10 text-red-600 dark:text-red-400",
            MAJOR: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
            MINOR: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
            COSMETIC: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
            INFO: "bg-muted text-muted-foreground",
          };
          return (
            <button
              key={severity}
              onClick={() =>
                setSelectedSeverity(
                  selectedSeverity === severity ? "All" : severity
                )
              }
              className={`rounded-lg p-4 text-center transition-all ${
                selectedSeverity === severity
                  ? "ring-primary ring-2"
                  : "hover:ring-muted hover:ring-2"
              } ${colors[severity]}`}
            >
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm font-medium">{severity}</p>
            </button>
          );
        })}
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.map((finding) => (
          <div
            key={finding.id}
            className="border-border bg-card hover:bg-muted/30 rounded-xl border p-6 shadow-sm transition-colors"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {getSeverityBadge(finding.severity)}
                  <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                    {finding.category}
                  </span>
                  {finding.isAiGenerated && (
                    <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                      <Sparkles className="h-3 w-3" />
                      AI Generated
                    </span>
                  )}
                </div>

                <h3 className="text-foreground text-lg font-semibold">
                  {finding.title}
                </h3>

                <p className="text-muted-foreground text-sm">
                  {finding.description}
                </p>

                <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {finding.location}
                  </span>
                  {finding.photoId && (
                    <span className="flex items-center gap-1">
                      <Camera className="h-4 w-4" />
                      Photo attached
                    </span>
                  )}
                  {finding.confidence && (
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-4 w-4" />
                      {Math.round(finding.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-right">
                  <div className="text-foreground flex items-center gap-1 text-lg font-semibold">
                    <DollarSign className="h-5 w-5" />
                    {formatCurrency(finding.costEstimate)}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Range: {formatCurrency(finding.costMin)} -{" "}
                    {formatCurrency(finding.costMax)}
                  </p>
                </div>

                <button className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFindings.length === 0 && (
        <div className="border-border bg-card rounded-xl border border-dashed p-12 text-center">
          <AlertTriangle className="text-muted-foreground mx-auto h-12 w-12" />
          <h3 className="text-foreground mt-4 font-semibold">
            No findings found
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Try adjusting your filters or add a new finding.
          </p>
        </div>
      )}
    </div>
  );
}
