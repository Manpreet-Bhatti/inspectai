"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { VoiceNote } from "@/types";

export const voiceNoteKeys = {
  all: ["voice-notes"] as const,
  lists: () => [...voiceNoteKeys.all, "list"] as const,
  list: (inspectionId: string) =>
    [...voiceNoteKeys.lists(), inspectionId] as const,
  details: () => [...voiceNoteKeys.all, "detail"] as const,
  detail: (id: string) => [...voiceNoteKeys.details(), id] as const,
};

interface VoiceNotesResponse {
  data: VoiceNote[];
}

interface UploadVoiceNoteParams {
  inspectionId: string;
  blob: Blob;
  duration: number;
}

export function useVoiceNotes(inspectionId: string) {
  return useQuery({
    queryKey: voiceNoteKeys.list(inspectionId),
    queryFn: () =>
      api.get<VoiceNotesResponse>(
        `/inspections/${inspectionId}/voice-notes`
      ),
    enabled: !!inspectionId,
  });
}

export function useVoiceNote(id: string) {
  return useQuery({
    queryKey: voiceNoteKeys.detail(id),
    queryFn: () => api.get<VoiceNote>(`/voice-notes/${id}`),
    enabled: !!id,
  });
}

export function useUploadVoiceNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      inspectionId,
      blob,
      duration,
    }: UploadVoiceNoteParams) => {
      const formData = new FormData();
      formData.append("inspectionId", inspectionId);
      formData.append("audio", blob, `voice-note-${Date.now()}.webm`);
      formData.append("duration", String(duration));
      return api.upload<VoiceNote>("/voice-notes", formData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: voiceNoteKeys.list(variables.inspectionId),
      });
    },
  });
}

export function useDeleteVoiceNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/voice-notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceNoteKeys.all });
    },
  });
}

export function useTranscribeVoiceNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ status: string; message: string }>(
        `/voice-notes/${id}/transcribe`
      ),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: voiceNoteKeys.detail(id) });
    },
  });
}
