"use client";

import Link from "next/link";
import { Sparkles, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { useSimilarFindings } from "@/hooks/useFindings";

interface SimilarFindingsProps {
  findingId: string;
  limit?: number;
}

function formatCategory(category: string): string {
  return category
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatCurrency(amount: number | null | undefined): string {
  if (!amount) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

const severityColor: Record<string, string> = {
  critical: "text-red-600 dark:text-red-400",
  major: "text-orange-600 dark:text-orange-400",
  minor: "text-yellow-600 dark:text-yellow-400",
  cosmetic: "text-blue-600 dark:text-blue-400",
  info: "text-muted-foreground",
};

export function SimilarFindings({ findingId, limit = 5 }: SimilarFindingsProps) {
  const { data, isLoading, error } = useSimilarFindings(findingId, limit);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Finding similar issues...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-destructive">
        <AlertCircle className="h-4 w-4" />
        Could not load similar findings
      </div>
    );
  }

  const similar = data?.similar ?? [];

  if (similar.length === 0) {
    return (
      <p className="py-3 text-sm text-muted-foreground">
        No similar findings found in historical inspections.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {similar.map((f) => (
        <div
          key={f.id}
          className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted/40 px-4 py-3"
        >
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="truncate text-sm font-medium text-foreground">
              {f.title}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span
                className={`font-medium capitalize ${severityColor[f.severity] ?? "text-muted-foreground"}`}
              >
                {f.severity}
              </span>
              <span>·</span>
              <span>{formatCategory(f.category)}</span>
              {f.costEstimate !== null && (
                <>
                  <span>·</span>
                  <span>{formatCurrency(f.costEstimate)}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {Math.round(f.similarity * 100)}% match
            </span>
            <Link
              href={`/inspections/${f.inspectionId}/findings`}
              className="text-muted-foreground hover:text-foreground"
              title="View in inspection"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SimilarFindingsPanel({ findingId }: { findingId: string }) {
  return (
    <div className="border-t border-border pt-4">
      <h4 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        Similar Historical Findings
      </h4>
      <SimilarFindings findingId={findingId} />
    </div>
  );
}
