"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { photoKeys } from "./usePhotos";
import { findingKeys } from "./useFindings";
import { voiceNoteKeys } from "./useVoiceNotes";

/**
 * Subscribes to Supabase Realtime for photo analysis completion events.
 * Automatically invalidates React Query cache when a photo's processed_at is set.
 */
export function usePhotoAnalysisUpdates(
  inspectionId: string | null,
  onUpdate?: (photo: Record<string, unknown>) => void
) {
  const queryClient = useQueryClient();
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!inspectionId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`photos:${inspectionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "photos",
          filter: `inspection_id=eq.${inspectionId}`,
        },
        (payload) => {
          const photo = payload.new as Record<string, unknown>;
          if (photo.processed_at) {
            queryClient.invalidateQueries({
              queryKey: photoKeys.detail(photo.id as string),
            });
            queryClient.invalidateQueries({
              queryKey: photoKeys.list(inspectionId),
            });
            onUpdateRef.current?.(photo);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [inspectionId, queryClient]);
}

/**
 * Subscribes to Supabase Realtime for new findings being inserted.
 * Automatically invalidates React Query cache when a new finding arrives.
 */
export function useFindingsUpdates(
  inspectionId: string | null,
  onInsert?: (finding: Record<string, unknown>) => void
) {
  const queryClient = useQueryClient();
  const onInsertRef = useRef(onInsert);
  onInsertRef.current = onInsert;

  useEffect(() => {
    if (!inspectionId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`findings:${inspectionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "findings",
          filter: `inspection_id=eq.${inspectionId}`,
        },
        (payload) => {
          const finding = payload.new as Record<string, unknown>;
          queryClient.invalidateQueries({
            queryKey: findingKeys.lists(),
          });
          onInsertRef.current?.(finding);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [inspectionId, queryClient]);
}

/**
 * Subscribes to voice_notes table updates for transcription completion.
 * Invalidates the voice notes list when a transcript arrives.
 */
export function useVoiceNoteUpdates(
  inspectionId: string | null,
  onUpdate?: (note: Record<string, unknown>) => void
) {
  const queryClient = useQueryClient();
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!inspectionId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`voice_notes:${inspectionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "voice_notes",
          filter: `inspection_id=eq.${inspectionId}`,
        },
        (payload) => {
          const note = payload.new as Record<string, unknown>;
          queryClient.invalidateQueries({
            queryKey: voiceNoteKeys.list(inspectionId),
          });
          if (note.id) {
            queryClient.invalidateQueries({
              queryKey: voiceNoteKeys.detail(note.id as string),
            });
          }
          onUpdateRef.current?.(note);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [inspectionId, queryClient]);
}

/**
 * Composes both photo and findings subscriptions for an inspection.
 * Returns connection status and optional callbacks for each event type.
 */
export function useInspectionRealtime(
  inspectionId: string | null,
  callbacks?: {
    onPhotoAnalyzed?: (photo: Record<string, unknown>) => void;
    onFindingCreated?: (finding: Record<string, unknown>) => void;
  }
) {
  const [photoUpdateCount, setPhotoUpdateCount] = useState(0);
  const [findingInsertCount, setFindingInsertCount] = useState(0);

  const handlePhotoUpdate = useCallback(
    (photo: Record<string, unknown>) => {
      setPhotoUpdateCount((n) => n + 1);
      callbacks?.onPhotoAnalyzed?.(photo);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleFindingInsert = useCallback(
    (finding: Record<string, unknown>) => {
      setFindingInsertCount((n) => n + 1);
      callbacks?.onFindingCreated?.(finding);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  usePhotoAnalysisUpdates(inspectionId, handlePhotoUpdate);
  useFindingsUpdates(inspectionId, handleFindingInsert);

  return { photoUpdateCount, findingInsertCount };
}

/**
 * Polls for photo analysis completion. Useful as a fallback when Realtime
 * is unavailable or for checking a specific photo after triggering analysis.
 */
export function usePhotoAnalysisPolling(
  photoId: string | null,
  config: { interval?: number; enabled?: boolean } = {}
) {
  const { interval = 2000, enabled = true } = config;
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<
    "idle" | "polling" | "complete" | "error"
  >("idle");

  useEffect(() => {
    if (!photoId || !enabled) {
      setStatus("idle");
      return;
    }

    setStatus("polling");
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/photos/${photoId}`);
        const photo = await response.json();

        if (photo.processedAt) {
          setStatus("complete");
          queryClient.invalidateQueries({
            queryKey: photoKeys.detail(photoId),
          });
          queryClient.invalidateQueries({ queryKey: photoKeys.lists() });
          clearInterval(pollInterval);
        } else if (photo.error) {
          setStatus("error");
          clearInterval(pollInterval);
        }
      } catch {
        setStatus("error");
        clearInterval(pollInterval);
      }
    }, interval);

    return () => clearInterval(pollInterval);
  }, [photoId, enabled, interval, queryClient]);

  return { status };
}

/**
 * Utility hook for optimistic updates with automatic rollback on failure.
 */
export function useOptimisticUpdate<T>() {
  const queryClient = useQueryClient();

  const optimisticUpdate = useCallback(
    async ({
      queryKey,
      updater,
      mutationFn,
    }: {
      queryKey: unknown[];
      updater: (old: T | undefined) => T;
      mutationFn: () => Promise<T>;
    }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousValue = queryClient.getQueryData<T>(queryKey);

      queryClient.setQueryData<T>(queryKey, updater);

      try {
        const result = await mutationFn();
        queryClient.setQueryData(queryKey, result);
        return result;
      } catch (error) {
        queryClient.setQueryData(queryKey, previousValue);
        throw error;
      }
    },
    [queryClient]
  );

  return { optimisticUpdate };
}
