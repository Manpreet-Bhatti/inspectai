"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { photoKeys } from "./usePhotos";
import { findingKeys } from "./useFindings";

interface PollingConfig {
  interval?: number;
  enabled?: boolean;
}

/**
 * Hook to poll for photo analysis results
 */
export function usePhotoAnalysisPolling(
  photoId: string | null,
  config: PollingConfig = {}
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
 * Hook for Server-Sent Events (SSE) for real-time updates
 * Can be used when SSE endpoint is implemented
 */
export function useRealtimeUpdates(inspectionId: string | null) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (!inspectionId) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(
      `/api/inspections/${inspectionId}/events`
    );

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      setTimeout(connect, 5000);
    };

    eventSource.addEventListener("photo_analyzed", (event) => {
      const data = JSON.parse(event.data);
      queryClient.invalidateQueries({
        queryKey: photoKeys.detail(data.photoId),
      });
      queryClient.invalidateQueries({
        queryKey: photoKeys.list(inspectionId),
      });
    });

    eventSource.addEventListener("finding_created", (event) => {
      const data = JSON.parse(event.data);
      queryClient.invalidateQueries({
        queryKey: findingKeys.list(inspectionId),
      });
      queryClient.setQueryData(
        findingKeys.detail(data.findingId),
        data.finding
      );
    });

    eventSource.addEventListener("voice_transcribed", () => {
      queryClient.invalidateQueries({
        queryKey: ["voice-notes", inspectionId],
      });
    });

    eventSourceRef.current = eventSource;
  }, [inspectionId, queryClient]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    // For now, SSE is not implemented, so don't connect
    // connect();
    // return disconnect;
    return () => {};
  }, [connect, disconnect]);

  return { isConnected, connect, disconnect };
}

/**
 * Hook to handle optimistic updates with rollback
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
