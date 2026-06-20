"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  Check,
  MoreVertical,
  Trash2,
  ZoomIn,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { BoundingBoxOverlay } from "./BoundingBoxOverlay";
import type { Photo } from "@/types";
import { cn } from "@/lib/utils";

interface PhotoAnalysisCardProps {
  photo: Photo;
  isSelected?: boolean;
  isAnalyzing?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAnalyze?: (id: string) => void;
}

function ConditionBadge({ condition }: { condition: string }) {
  const lower = condition.toLowerCase();
  if (lower === "good condition")
    return (
      <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
        Good
      </span>
    );
  if (lower === "fair condition")
    return (
      <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
        Fair
      </span>
    );
  if (lower === "poor condition")
    return (
      <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-400">
        Poor
      </span>
    );
  if (lower === "damaged")
    return (
      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
        Damaged
      </span>
    );
  return (
    <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
      {condition}
    </span>
  );
}

export function PhotoAnalysisCard({
  photo,
  isSelected = false,
  isAnalyzing = false,
  onSelect,
  onDelete,
  onAnalyze,
}: PhotoAnalysisCardProps) {
  const [showBoxes, setShowBoxes] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const isProcessed = !!photo.processedAt;
  const hasError = !!photo.error;
  const isPending = !isProcessed && !hasError && !isAnalyzing;
  const hasObjects = isProcessed && photo.aiObjects && photo.aiObjects.length > 0;

  return (
    <div
      className={cn(
        "bg-card group relative flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all",
        isSelected
          ? "border-primary ring-primary/20 ring-2"
          : "border-border hover:border-muted-foreground/50"
      )}
    >
      {/* Checkbox */}
      {onSelect && (
        <button
          onClick={() => onSelect(photo.id)}
          className={cn(
            "absolute top-3 left-3 z-20 flex h-6 w-6 items-center justify-center rounded-md border transition-all",
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-white/50 bg-black/30 text-white opacity-0 group-hover:opacity-100"
          )}
        >
          {isSelected && <Check className="h-4 w-4" />}
        </button>
      )}

      {/* Toggle bounding boxes */}
      {hasObjects && (
        <button
          onClick={() => setShowBoxes((v) => !v)}
          title={showBoxes ? "Hide detections" : "Show detections"}
          className="absolute top-3 right-3 z-20 flex h-6 w-6 items-center justify-center rounded-md border border-white/50 bg-black/30 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-black/50"
        >
          {showBoxes ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      )}

      {/* Image area */}
      <div className="bg-muted relative aspect-video overflow-hidden">
        {photo.originalUrl || photo.thumbnailUrl ? (
          <>
            <Image
              src={(photo.thumbnailUrl || photo.originalUrl)!}
              alt={photo.fileName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
              loading="lazy"
            />
            {hasObjects && showBoxes && (
              <BoundingBoxOverlay
                objects={photo.aiObjects!}
                imageWidth={photo.width ?? 640}
                imageHeight={photo.height ?? 480}
              />
            )}
          </>
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}

        {/* Analyzing overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 backdrop-blur-[2px]">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
            <span className="text-xs font-medium text-white">Analyzing…</span>
          </div>
        )}

        {/* Error overlay badge */}
        {hasError && !isAnalyzing && (
          <div className="absolute bottom-2 left-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/90 px-2 py-0.5 text-xs font-medium text-white">
              <AlertCircle className="h-3 w-3" />
              Error
            </span>
          </div>
        )}

        {/* Processed badge */}
        {isProcessed && !isAnalyzing && (
          <div className="absolute bottom-2 left-2 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
              <ZoomIn className="h-3 w-3" />
              {hasObjects ? `${photo.aiObjects!.length} detected` : "Analyzed"}
            </span>
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-sm font-medium">
              {photo.fileName}
            </p>
            {photo.location && (
              <p className="text-muted-foreground text-xs">{photo.location}</p>
            )}
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-1 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="bg-popover border-border absolute top-7 right-0 z-30 min-w-[140px] rounded-lg border py-1 shadow-lg">
                  {!isProcessed && !isAnalyzing && onAnalyze && (
                    <button
                      onClick={() => {
                        onAnalyze(photo.id);
                        setMenuOpen(false);
                      }}
                      className="text-foreground hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-sm"
                    >
                      <Sparkles className="h-4 w-4" />
                      Analyze
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(photo.id);
                        setMenuOpen(false);
                      }}
                      className="text-destructive hover:bg-destructive/10 flex w-full items-center gap-2 px-3 py-2 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Analysis content */}
        <div className="mt-3">
          {isAnalyzing && (
            <div className="bg-primary/5 border-primary/20 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="text-primary h-3.5 w-3.5 animate-spin" />
                <span className="text-primary text-xs font-medium">
                  AI analysis in progress…
                </span>
              </div>
              <div className="mt-2 space-y-1.5">
                {["Caption", "Objects", "Condition"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div className="text-muted-foreground w-14 text-xs">{item}</div>
                    <div className="bg-muted h-2.5 flex-1 animate-pulse rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {isPending && (
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-muted-foreground text-xs">Not yet analyzed</p>
              {onAnalyze && (
                <button
                  onClick={() => onAnalyze(photo.id)}
                  className="text-primary mt-1.5 inline-flex items-center gap-1 text-xs font-medium hover:underline"
                >
                  <Sparkles className="h-3 w-3" />
                  Run analysis
                </button>
              )}
            </div>
          )}

          {hasError && !isAnalyzing && (
            <div className="bg-destructive/5 border-destructive/20 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-destructive h-3.5 w-3.5 flex-shrink-0" />
                <span className="text-destructive text-xs font-medium">
                  Analysis failed
                </span>
              </div>
              <p className="text-muted-foreground mt-1 truncate text-xs">
                {photo.error}
              </p>
              {onAnalyze && (
                <button
                  onClick={() => onAnalyze(photo.id)}
                  className="text-primary mt-1.5 text-xs font-medium hover:underline"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          {isProcessed && !isAnalyzing && (
            <div className="bg-muted/40 rounded-lg p-3 space-y-2.5">
              {/* Caption */}
              <div>
                <div className="mb-1 flex items-center gap-1">
                  <Sparkles className="text-primary h-3 w-3" />
                  <span className="text-primary text-xs font-medium">AI Caption</span>
                </div>
                <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                  {photo.aiCaption}
                </p>
              </div>

              {/* Condition + confidence */}
              <div className="flex items-center justify-between">
                {photo.aiCondition && (
                  <ConditionBadge condition={photo.aiCondition} />
                )}
                {photo.aiConfidence != null && (
                  <span className="text-muted-foreground text-xs">
                    {Math.round(photo.aiConfidence * 100)}% confidence
                  </span>
                )}
              </div>

              {/* Detected objects */}
              {hasObjects && (
                <div>
                  <p className="text-muted-foreground mb-1 text-xs font-medium">
                    Detected ({photo.aiObjects!.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {photo.aiObjects!.slice(0, 6).map((obj, i) => (
                      <span
                        key={i}
                        className="bg-background border-border rounded border px-1.5 py-0.5 text-xs"
                      >
                        {obj.label}
                      </span>
                    ))}
                    {photo.aiObjects!.length > 6 && (
                      <span className="text-muted-foreground text-xs">
                        +{photo.aiObjects!.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
