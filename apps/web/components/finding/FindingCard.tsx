"use client";

import { useState } from "react";
import {
  MapPin,
  Camera,
  Sparkles,
  MoreVertical,
  DollarSign,
  Edit,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { SeverityBadge } from "./SeverityBadge";
import { SimilarFindingsPanel } from "./SimilarFindings";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import { useDeleteFinding, useUpdateFindingStatus } from "@/hooks/useFindings";
import type { Finding, FindingStatus, Severity } from "@/types";

const STATUS_OPTIONS: { value: FindingStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "DISPUTED", label: "Disputed" },
];

function formatCurrency(amount: number | null | undefined) {
  if (!amount) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCategory(category: string | null | undefined): string {
  if (!category) return "Other";
  return category
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

interface FindingCardProps {
  finding: Finding;
  onEdit: (finding: Finding) => void;
}

export function FindingCard({ finding, onEdit }: FindingCardProps) {
  const [showSimilar, setShowSimilar] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const deleteFinding = useDeleteFinding();
  const updateStatus = useUpdateFindingStatus();

  const severity = (finding.severity?.toUpperCase() ?? "INFO") as Severity;
  const statusLower = finding.status?.toLowerCase() ?? "active";

  async function handleDelete() {
    await deleteFinding.mutateAsync(finding.id);
  }

  return (
    <div className="border-border bg-card hover:bg-muted/30 rounded-xl border p-6 shadow-sm transition-colors">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* Left: metadata + text */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={severity} />
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
              {formatCategory(finding.category)}
            </span>
            {statusLower !== "active" && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  statusLower === "resolved"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                }`}
              >
                {statusLower}
              </span>
            )}
            {finding.isAiGenerated && (
              <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                <Sparkles className="h-3 w-3" />
                AI Generated
              </span>
            )}
          </div>

          <h3 className="text-foreground text-lg font-semibold">{finding.title}</h3>
          <p className="text-muted-foreground text-sm">
            {finding.description || "No description provided."}
          </p>

          <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {finding.location || "No location specified"}
            </span>
            {finding.photoId && (
              <span className="flex items-center gap-1">
                <Camera className="h-4 w-4" />
                Photo attached
              </span>
            )}
            {finding.confidence != null && (
              <span className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                {Math.round(finding.confidence * 100)}% confidence
              </span>
            )}
          </div>
        </div>

        {/* Right: cost + actions */}
        <div className="flex items-start gap-2">
          <div className="mr-2 text-right">
            <div className="text-foreground flex items-center gap-1 text-lg font-semibold">
              <DollarSign className="h-5 w-5" />
              {formatCurrency(finding.costEstimate)}
            </div>
            {(finding.costMin || finding.costMax) && (
              <p className="text-muted-foreground text-xs">
                Range: {formatCurrency(finding.costMin)} –{" "}
                {formatCurrency(finding.costMax)}
              </p>
            )}
          </div>

          <button
            onClick={() => setShowSimilar((v) => !v)}
            className={`rounded-lg p-2 transition-colors ${
              showSimilar
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            title="Show similar findings"
          >
            <Sparkles className="h-4 w-4" />
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={deleteFinding.isPending}
                className="text-destructive hover:bg-destructive/10 rounded-lg p-2 transition-colors"
                title="Confirm delete"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-muted-foreground hover:bg-muted rounded-lg p-2 transition-colors"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(finding)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {STATUS_OPTIONS.filter(
                  (s) => s.value.toLowerCase() !== statusLower
                ).map((s) => (
                  <DropdownMenuItem
                    key={s.value}
                    onClick={() =>
                      updateStatus.mutate({ id: finding.id, status: s.value })
                    }
                  >
                    Mark as {s.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setConfirmDelete(true)}
                  className="text-destructive hover:text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {showSimilar && <SimilarFindingsPanel findingId={finding.id} />}
    </div>
  );
}
