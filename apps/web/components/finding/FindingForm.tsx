"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { useCreateFinding, useUpdateFinding } from "@/hooks/useFindings";
import type { Finding, FindingFormData, FindingCategory, Severity } from "@/types";

const CATEGORIES: { value: FindingCategory; label: string }[] = [
  { value: "STRUCTURAL", label: "Structural" },
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "PLUMBING", label: "Plumbing" },
  { value: "HVAC", label: "HVAC" },
  { value: "ROOFING", label: "Roofing" },
  { value: "EXTERIOR", label: "Exterior" },
  { value: "INTERIOR", label: "Interior" },
  { value: "APPLIANCES", label: "Appliances" },
  { value: "SAFETY", label: "Safety" },
  { value: "COSMETIC", label: "Cosmetic" },
];

const SEVERITIES: { value: Severity; label: string }[] = [
  { value: "CRITICAL", label: "Critical" },
  { value: "MAJOR", label: "Major" },
  { value: "MINOR", label: "Minor" },
  { value: "COSMETIC", label: "Cosmetic" },
  { value: "INFO", label: "Info" },
];

const fieldClass =
  "border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1";

interface FindingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspectionId: string;
  finding?: Finding;
  onSuccess?: () => void;
}

function emptyForm(finding?: Finding): FindingFormData {
  return {
    title: finding?.title ?? "",
    description: finding?.description ?? "",
    category: (finding?.category?.toUpperCase() ?? "STRUCTURAL") as FindingCategory,
    severity: (finding?.severity?.toUpperCase() ?? "MINOR") as Severity,
    location: finding?.location ?? "",
    costEstimate: finding?.costEstimate ?? undefined,
    costMin: finding?.costMin ?? undefined,
    costMax: finding?.costMax ?? undefined,
  };
}

export function FindingForm({
  open,
  onOpenChange,
  inspectionId,
  finding,
  onSuccess,
}: FindingFormProps) {
  const isEdit = !!finding;

  const [form, setForm] = useState<FindingFormData>(() => emptyForm(finding));
  const [errors, setErrors] = useState<Partial<Record<keyof FindingFormData, string>>>({});
  const [estimating, setEstimating] = useState(false);
  const [classifying, setClassifying] = useState(false);

  async function handleAutoClassify() {
    if (!form.title.trim() || !form.description.trim()) return;
    setClassifying(true);
    try {
      const res = await fetch("/api/findings/classify-severity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
        }),
      });
      if (!res.ok) throw new Error("classification failed");
      const data = await res.json();
      set("severity", (data.severity as string).toUpperCase() as Severity);
    } catch {
      // silent — user keeps current selection
    } finally {
      setClassifying(false);
    }
  }

  async function handleAutoEstimate() {
    setEstimating(true);
    try {
      const res = await fetch("/api/costs/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          severity: form.severity,
          description: form.description || undefined,
        }),
      });
      if (!res.ok) throw new Error("estimation failed");
      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        costEstimate: Math.round(data.estimate),
        costMin: Math.round(data.min_cost),
        costMax: Math.round(data.max_cost),
      }));
    } catch {
      // silent — user can still enter manually
    } finally {
      setEstimating(false);
    }
  }

  // Reset when switching between create / edit targets
  useEffect(() => {
    setForm(emptyForm(finding));
    setErrors({});
  }, [finding?.id]);

  const createFinding = useCreateFinding();
  const updateFinding = useUpdateFinding();
  const isPending = createFinding.isPending || updateFinding.isPending;
  const mutationError = createFinding.error || updateFinding.error;

  function set<K extends keyof FindingFormData>(key: K, value: FindingFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FindingFormData, string>> = {};
    if (!form.title.trim()) next.title = "Title is required";
    if (!form.description.trim()) next.description = "Description is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      await updateFinding.mutateAsync({ id: finding.id, data: form });
    } else {
      await createFinding.mutateAsync({ ...form, inspectionId });
    }

    onOpenChange(false);
    onSuccess?.();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Finding" : "Add Finding"}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Cracked foundation wall"
              className={fieldClass}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={4}
              className={`${fieldClass} resize-none`}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Category + Severity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value as FindingCategory)}
                className={fieldClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Severity</label>
                <button
                  type="button"
                  onClick={handleAutoClassify}
                  disabled={classifying || !form.title.trim() || !form.description.trim()}
                  className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {classifying ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Wand2 className="h-3 w-3" />
                  )}
                  Auto-classify
                </button>
              </div>
              <select
                value={form.severity}
                onChange={(e) => set("severity", e.target.value as Severity)}
                className={fieldClass}
              >
                {SEVERITIES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Location</label>
            <input
              value={form.location ?? ""}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. North basement wall"
              className={fieldClass}
            />
          </div>

          {/* Cost fields */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Cost Estimate ($)
              </label>
              <button
                type="button"
                onClick={handleAutoEstimate}
                disabled={estimating}
                className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-medium transition-colors disabled:opacity-50"
              >
                {estimating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                Auto-estimate
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { key: "costEstimate", label: "Estimate" },
                  { key: "costMin", label: "Min" },
                  { key: "costMax", label: "Max" },
                ] as const
              ).map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{label}</label>
                  <input
                    type="number"
                    min="0"
                    value={form[key] ?? ""}
                    onChange={(e) =>
                      set(key, e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="0"
                    className={fieldClass}
                  />
                </div>
              ))}
            </div>
          </div>

          {mutationError && (
            <p className="text-sm text-destructive">
              Failed to {isEdit ? "update" : "create"} finding. Please try again.
            </p>
          )}

          <SheetFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Add Finding"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
