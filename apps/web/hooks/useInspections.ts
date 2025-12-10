"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Inspection,
  InspectionFormData,
  PaginatedResponse,
  InspectionFilters,
} from "@/types";

export const inspectionKeys = {
  all: ["inspections"] as const,
  lists: () => [...inspectionKeys.all, "list"] as const,
  list: (filters: InspectionFilters) =>
    [...inspectionKeys.lists(), filters] as const,
  details: () => [...inspectionKeys.all, "detail"] as const,
  detail: (id: string) => [...inspectionKeys.details(), id] as const,
};

/**
 * Hook to fetch paginated list of inspections
 */
export function useInspections(filters: InspectionFilters = {}) {
  return useQuery({
    queryKey: inspectionKeys.list(filters),
    queryFn: () =>
      api.get<PaginatedResponse<Inspection>>("/inspections", {
        params: {
          page: filters.page,
          limit: filters.limit,
          status: filters.status,
          propertyType: filters.propertyType,
          search: filters.search,
        },
      }),
  });
}

/**
 * Hook to fetch a single inspection by ID
 */
export function useInspection(id: string) {
  return useQuery({
    queryKey: inspectionKeys.detail(id),
    queryFn: () => api.get<Inspection>(`/inspections/${id}`),
    enabled: !!id,
  });
}

/**
 * Hook to create a new inspection
 */
export function useCreateInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InspectionFormData) =>
      api.post<Inspection>("/inspections", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inspectionKeys.lists() });
    },
  });
}

/**
 * Hook to update an inspection
 */
export function useUpdateInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InspectionFormData>;
    }) => api.patch<Inspection>(`/inspections/${id}`, data),
    onSuccess: (updatedInspection) => {
      queryClient.setQueryData(
        inspectionKeys.detail(updatedInspection.id),
        updatedInspection
      );
      queryClient.invalidateQueries({ queryKey: inspectionKeys.lists() });
    },
  });
}

/**
 * Hook to delete an inspection
 */
export function useDeleteInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/inspections/${id}`),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: inspectionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: inspectionKeys.lists() });
    },
  });
}

/**
 * Hook to update inspection status
 */
export function useUpdateInspectionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: Inspection["status"];
    }) => api.patch<Inspection>(`/inspections/${id}`, { status }),
    onSuccess: (updatedInspection) => {
      queryClient.setQueryData(
        inspectionKeys.detail(updatedInspection.id),
        updatedInspection
      );
      queryClient.invalidateQueries({ queryKey: inspectionKeys.lists() });
    },
  });
}
