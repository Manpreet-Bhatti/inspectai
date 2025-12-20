import Link from "next/link";
import { notFound } from "next/navigation";
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
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Finding = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  severity: string | null;
  location: string | null;
  cost_estimate: number | null;
  cost_min: number | null;
  cost_max: number | null;
  is_ai_generated: boolean | null;
  confidence: number | null;
  photo_id: string | null;
};

function getSeverityBadge(severity: string | null) {
  switch (severity?.toLowerCase()) {
    case "critical":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertTriangle className="h-3 w-3" />
          Critical
        </span>
      );
    case "major":
      return (
        <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-400">
          Major
        </span>
      );
    case "minor":
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
          Minor
        </span>
      );
    case "cosmetic":
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

function formatCurrency(amount: number | null) {
  if (amount === null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCategory(category: string | null): string {
  if (!category) return "Other";
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default async function FindingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Verify user owns the inspection
  const { data: inspection, error: inspectionError } = await supabase
    .from("inspections")
    .select("id, user_id, title")
    .eq("id", id)
    .single();

  if (inspectionError || !inspection) {
    notFound();
  }

  if (inspection.user_id !== user.id) {
    notFound();
  }

  // Fetch findings
  const { data: findings } = (await supabase
    .from("findings")
    .select(
      "id, title, description, category, severity, location, cost_estimate, cost_min, cost_max, is_ai_generated, confidence, photo_id"
    )
    .eq("inspection_id", id)
    .order("created_at", { ascending: false })) as { data: Finding[] | null };

  const findingsList = findings || [];

  // Calculate totals
  const totalEstimatedCost = findingsList.reduce(
    (sum, f) => sum + (f.cost_estimate || 0),
    0
  );

  // Count by severity
  const severityCounts = {
    critical: findingsList.filter((f) => f.severity?.toLowerCase() === "critical").length,
    major: findingsList.filter((f) => f.severity?.toLowerCase() === "major").length,
    minor: findingsList.filter((f) => f.severity?.toLowerCase() === "minor").length,
    cosmetic: findingsList.filter((f) => f.severity?.toLowerCase() === "cosmetic").length,
    info: findingsList.filter(
      (f) => !f.severity || !["critical", "major", "minor", "cosmetic"].includes(f.severity.toLowerCase())
    ).length,
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
            Findings
          </h1>
          <p className="text-muted-foreground">
            {findingsList.length} findings · Total estimated cost:{" "}
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
          <select className="border-input bg-background text-foreground focus:border-primary focus:ring-primary rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1">
            <option value="">All Categories</option>
            <option value="structural">Structural</option>
            <option value="electrical">Electrical</option>
            <option value="plumbing">Plumbing</option>
            <option value="hvac">HVAC</option>
            <option value="roofing">Roofing</option>
            <option value="exterior">Exterior</option>
            <option value="interior">Interior</option>
            <option value="safety">Safety</option>
            <option value="cosmetic">Cosmetic</option>
          </select>
          <select className="border-input bg-background text-foreground focus:border-primary focus:ring-primary rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1">
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
            <option value="cosmetic">Cosmetic</option>
            <option value="info">Info</option>
          </select>
          <button className="border-input bg-background text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <Filter className="h-4 w-4" />
            More
          </button>
        </div>
      </div>

      {/* Severity Summary */}
      <div className="grid gap-4 sm:grid-cols-5">
        {(
          [
            { key: "critical", label: "Critical", color: "bg-red-500/10 text-red-600 dark:text-red-400" },
            { key: "major", label: "Major", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
            { key: "minor", label: "Minor", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" },
            { key: "cosmetic", label: "Cosmetic", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
            { key: "info", label: "Info", color: "bg-muted text-muted-foreground" },
          ] as const
        ).map((severity) => (
          <div
            key={severity.key}
            className={`rounded-lg p-4 text-center ${severity.color}`}
          >
            <p className="text-2xl font-bold">{severityCounts[severity.key]}</p>
            <p className="text-sm font-medium">{severity.label}</p>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {findingsList.length === 0 ? (
        <div className="border-border bg-card rounded-xl border border-dashed p-12 text-center">
          <AlertTriangle className="text-muted-foreground mx-auto h-12 w-12" />
          <h3 className="text-foreground mt-4 font-semibold">
            No findings yet
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Add findings to document issues discovered during the inspection.
          </p>
          <button className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold">
            <Plus className="h-4 w-4" />
            Add Finding
          </button>
        </div>
      ) : (
        /* Findings List */
        <div className="space-y-4">
          {findingsList.map((finding) => (
            <div
              key={finding.id}
              className="border-border bg-card hover:bg-muted/30 rounded-xl border p-6 shadow-sm transition-colors"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {getSeverityBadge(finding.severity)}
                    <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
                      {formatCategory(finding.category)}
                    </span>
                    {finding.is_ai_generated && (
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
                    {finding.description || "No description provided."}
                  </p>

                  <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {finding.location || "No location specified"}
                    </span>
                    {finding.photo_id && (
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
                      {formatCurrency(finding.cost_estimate)}
                    </div>
                    {(finding.cost_min || finding.cost_max) && (
                      <p className="text-muted-foreground text-xs">
                        Range: {formatCurrency(finding.cost_min)} -{" "}
                        {formatCurrency(finding.cost_max)}
                      </p>
                    )}
                  </div>

                  <button className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
