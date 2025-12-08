"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Photo, PhotoCategory } from "@/types";

export const photoKeys = {
  all: ["photos"] as const,
  lists: () => [...photoKeys.all, "list"] as const,
  list: (inspectionId: string) => [...photoKeys.lists(), inspectionId] as const,
  details: () => [...photoKeys.all, "detail"] as const,
  detail: (id: string) => [...photoKeys.details(), id] as const,
};

interface PhotosResponse {
  data: Photo[];
}

interface UploadPhotosParams {
  inspectionId: string;
  files: File[];
  category?: PhotoCategory;
  location?: string;
}

interface UploadResponse {
  photos: Photo[];
  message: string;
}

/**
 * Hook to fetch photos for an inspection
 */
export function usePhotos(inspectionId: string) {
  return useQuery({
    queryKey: photoKeys.list(inspectionId),
    queryFn: () =>
      api.get<PhotosResponse>(`/inspections/${inspectionId}/photos`),
    enabled: !!inspectionId,
  });
}

/**
 * Hook to fetch a single photo by ID
 */
export function usePhoto(id: string) {
  return useQuery({
    queryKey: photoKeys.detail(id),
    queryFn: () => api.get<Photo>(`/photos/${id}`),
    enabled: !!id,
  });
}

/**
 * Hook to upload photos
 */
export function useUploadPhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      inspectionId,
      files,
      category,
      location,
    }: UploadPhotosParams) => {
      const formData = new FormData();
      formData.append("inspectionId", inspectionId);
      if (category) formData.append("category", category);
      if (location) formData.append("location", location);
      files.forEach((file) => formData.append("files", file));

      return api.upload<UploadResponse>("/photos", formData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: photoKeys.list(variables.inspectionId),
      });
    },
  });
}

/**
 * Hook to delete a photo
 */
export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/photos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all });
    },
  });
}

/**
 * Hook to trigger AI analysis on a photo
 */
export function useAnalyzePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ status: string; message: string }>(`/photos/${id}/analyze`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: photoKeys.detail(id) });
    },
  });
}

/**
 * Hook to batch analyze multiple photos
 */
export function useBatchAnalyzePhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(
        ids.map((id) =>
          api.post<{ status: string; message: string }>(`/photos/${id}/analyze`)
        )
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: photoKeys.all });
    },
  });
}
