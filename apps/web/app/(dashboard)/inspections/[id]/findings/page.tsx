"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  AlertTriangle,
  DollarSign,
  Loader2,
} from "lucide-react";
import { useFindings } from "@/hooks/useFindings";
import { useFindingsUpdates } from "@/hooks/useRealtime";
import { Button } from "@/components/ui/Button";
import { FindingCard } from "@/components/finding/FindingCard";
import { FindingForm } from "@/components/finding/FindingForm";
import type { Finding, FindingFilters } from "@/types";

function formatCurrency(amount: number | null | undefined) {
  if (!amount) return "$0";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingFinding, setEditingFinding] = useState<Finding | undefined>(undefined);

  const filters: FindingFilters = {
    ...(categoryFilter && { category: categoryFilter as FindingFilters["category"] }),
    ...(severityFilter && { severity: severityFilter as FindingFilters["severity"] }),
    ...(searchQuery && { search: searchQuery }),
  };

  const { data: findingsData, isLoading, error, refetch } = useFindings(id, filters);

  useFindingsUpdates(id);

  const findings = findingsData?.data ?? [];

  const totalEstimatedCost = findings.reduce(
    (sum, f) => sum + (f.costEstimate ?? 0),
    0
  );

  const severityCounts = {
    critical: findings.filter((f) => f.severity?.toLowerCase() === "critical").length,
    major: findings.filter((f) => f.severity?.toLowerCase() === "major").length,
    minor: findings.filter((f) => f.severity?.toLowerCase() === "minor").length,
    cosmetic: findings.filter((f) => f.severity?.toLowerCase() === "cosmetic").length,
    info: findings.filter(
      (f) =>
        !f.severity ||
        !["critical", "major", "minor", "cosmetic"].includes(f.severity.toLowerCase())
    ).length,
  };

  function openCreate() {
    setEditingFinding(undefined);
    setFormOpen(true);
  }

  function openEdit(finding: Finding) {
    setEditingFinding(finding);
    setFormOpen(true);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
          <p className="text-muted-foreground mt-2">Loading findings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load findings</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-4">
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FindingForm
        key={editingFinding?.id ?? "create"}
        open={formOpen}
        onOpenChange={setFormOpen}
        inspectionId={id}
        finding={editingFinding}
      />

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
            {findings.length} finding{findings.length !== 1 ? "s" : ""} ·{" "}
            <span className="inline-flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              {formatCurrency(totalEstimatedCost)} estimated
            </span>
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Finding
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search findings..."
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full rounded-lg border py-2 pl-10 pr-4 focus:outline-none focus:ring-1"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border-input bg-background text-foreground focus:border-primary focus:ring-primary rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1"
          >
            <option value="">All Categories</option>
            <option value="structural">Structural</option>
            <option value="electrical">Electrical</option>
            <option value="plumbing">Plumbing</option>
            <option value="hvac">HVAC</option>
            <option value="roofing">Roofing</option>
            <option value="exterior">Exterior</option>
            <option value="interior">Interior</option>
            <option value="appliances">Appliances</option>
            <option value="safety">Safety</option>
            <option value="cosmetic">Cosmetic</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="border-input bg-background text-foreground focus:border-primary focus:ring-primary rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
            <option value="cosmetic">Cosmetic</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Severity Summary */}
      <div className="grid gap-4 sm:grid-cols-5">
        {(
          [
            {
              key: "critical",
              label: "Critical",
              color: "bg-red-500/10 text-red-600 dark:text-red-400",
            },
            {
              key: "major",
              label: "Major",
              color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
            },
            {
              key: "minor",
              label: "Minor",
              color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
            },
            {
              key: "cosmetic",
              label: "Cosmetic",
              color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
            },
            {
              key: "info",
              label: "Info",
              color: "bg-muted text-muted-foreground",
            },
          ] as const
        ).map((s) => (
          <div key={s.key} className={`rounded-lg p-4 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{severityCounts[s.key]}</p>
            <p className="text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {findings.length === 0 ? (
        <div className="border-border bg-card rounded-xl border border-dashed p-12 text-center">
          <AlertTriangle className="text-muted-foreground mx-auto h-12 w-12" />
          <h3 className="text-foreground mt-4 font-semibold">No findings yet</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Add findings to document issues discovered during the inspection.
          </p>
          <Button onClick={openCreate} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Add Finding
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {findings.map((finding) => (
            <FindingCard key={finding.id} finding={finding} onEdit={openEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
