"use client";

import { useState, useCallback } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { PhotoAnalysisCard } from "./PhotoAnalysisCard";
import { useDeletePhoto, useAnalyzePhoto } from "@/hooks/usePhotos";
import { usePhotoAnalysisUpdates } from "@/hooks/useRealtime";
import type { Photo } from "@/types";

interface PhotoGridProps {
  photos: Photo[];
  inspectionId: string;
  selectedPhotos: string[];
  onSelectPhoto: (id: string) => void;
}

export function PhotoGrid({
  photos,
  inspectionId,
  selectedPhotos,
  onSelectPhoto,
}: PhotoGridProps) {
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [recentlyAnalyzed, setRecentlyAnalyzed] = useState<string[]>([]);

  const deletePhotoMutation = useDeletePhoto();
  const analyzePhotoMutation = useAnalyzePhoto();

  // When realtime update arrives, remove from analyzingIds and track recently analyzed
  usePhotoAnalysisUpdates(
    inspectionId,
    useCallback((photo: Record<string, unknown>) => {
      const id = photo.id as string;
      setAnalyzingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setRecentlyAnalyzed((prev) => {
        const next = [id, ...prev.filter((x) => x !== id)].slice(0, 5);
        return next;
      });
    }, [])
  );

  const handleAnalyze = async (id: string) => {
    setAnalyzingIds((prev) => new Set(prev).add(id));
    try {
      await analyzePhotoMutation.mutateAsync(id);
    } catch {
      setAnalyzingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDelete = async (id: string) => {
    await deletePhotoMutation.mutateAsync(id);
  };

  if (photos.length === 0) return null;

  const analyzingCount = analyzingIds.size;

  return (
    <div className="space-y-4">
      {/* Live analysis status banner */}
      {analyzingCount > 0 && (
        <div className="bg-primary/5 border-primary/20 flex items-center gap-3 rounded-lg border px-4 py-3">
          <Loader2 className="text-primary h-4 w-4 animate-spin" />
          <span className="text-primary text-sm font-medium">
            Analyzing {analyzingCount} photo{analyzingCount !== 1 ? "s" : ""}…
          </span>
          <span className="text-muted-foreground text-xs">
            Results will appear automatically when complete
          </span>
        </div>
      )}

      {/* Recently analyzed flash */}
      {recentlyAnalyzed.length > 0 && analyzingCount === 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-green-500/10 px-4 py-3">
          <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            Analysis complete
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {photos.map((photo) => (
          <PhotoAnalysisCard
            key={photo.id}
            photo={photo}
            isSelected={selectedPhotos.includes(photo.id)}
            isAnalyzing={analyzingIds.has(photo.id)}
            onSelect={onSelectPhoto}
            onDelete={handleDelete}
            onAnalyze={handleAnalyze}
          />
        ))}
      </div>
    </div>
  );
}
