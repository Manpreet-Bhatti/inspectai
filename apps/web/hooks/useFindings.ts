"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Finding,
  FindingFormData,
  FindingFilters,
  SimilarFinding,
} from "@/types";

export const findingKeys = {
  all: ["findings"] as const,
  lists: () => [...findingKeys.all, "list"] as const,
  list: (inspectionId: string, filters?: FindingFilters) =>
    [...findingKeys.lists(), inspectionId, filters] as const,
  details: () => [...findingKeys.all, "detail"] as const,
  detail: (id: string) => [...findingKeys.details(), id] as const,
  similar: (id: string) => [...findingKeys.all, "similar", id] as const,
};

interface FindingsResponse {
  data: Finding[];
}

interface SimilarFindingsResponse {
  findingId: string;
  similar: SimilarFinding[];
}

/**
 * Hook to fetch findings for an inspection
 */
export function useFindings(inspectionId: string, filters?: FindingFilters) {
  return useQuery({
    queryKey: findingKeys.list(inspectionId, filters),
    queryFn: () =>
      api.get<FindingsResponse>("/findings", {
        params: {
          inspectionId,
          category: filters?.category,
          severity: filters?.severity,
          status: filters?.status,
          search: filters?.search,
        },
      }),
    enabled: !!inspectionId,
  });
}

/**
 * Hook to fetch a single finding by ID
 */
export function useFinding(id: string) {
  return useQuery({
    queryKey: findingKeys.detail(id),
    queryFn: () => api.get<Finding>(`/findings/${id}`),
    enabled: !!id,
  });
}

/**
 * Hook to create a new finding
 */
export function useCreateFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FindingFormData & { inspectionId: string }) =>
      api.post<Finding>("/findings", data),
    onSuccess: (finding) => {
      queryClient.invalidateQueries({
        queryKey: findingKeys.lists(),
      });
      queryClient.setQueryData(findingKeys.detail(finding.id), finding);
    },
  });
}

/**
 * Hook to update a finding
 */
export function useUpdateFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<FindingFormData>;
    }) => api.patch<Finding>(`/findings/${id}`, data),
    onSuccess: (updatedFinding) => {
      queryClient.setQueryData(
        findingKeys.detail(updatedFinding.id),
        updatedFinding
      );
      queryClient.invalidateQueries({ queryKey: findingKeys.lists() });
    },
  });
}

/**
 * Hook to delete a finding
 */
export function useDeleteFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/findings/${id}`),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: findingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: findingKeys.lists() });
    },
  });
}

/**
 * Hook to get similar findings using vector similarity search
 */
export function useSimilarFindings(id: string, limit: number = 5) {
  return useQuery({
    queryKey: findingKeys.similar(id),
    queryFn: () =>
      api.get<SimilarFindingsResponse>(`/findings/${id}/similar`, {
        params: { limit },
      }),
    enabled: !!id,
  });
}

/**
 * Hook to update finding status
 */
export function useUpdateFindingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Finding["status"] }) =>
      api.patch<Finding>(`/findings/${id}`, { status }),
    onSuccess: (updatedFinding) => {
      queryClient.setQueryData(
        findingKeys.detail(updatedFinding.id),
        updatedFinding
      );
      queryClient.invalidateQueries({ queryKey: findingKeys.lists() });
    },
  });
}
