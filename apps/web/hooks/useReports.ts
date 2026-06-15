"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Report, ReportType } from "@/types";

interface GenerateReportPayload {
  inspectionId: string;
  type: ReportType;
}

interface GenerateReportResponse {
  id: string;
  inspectionId: string;
  type: string;
  storagePath: string | null;
  summary: string | null;
  totalCost: number | null;
  generatedAt: string;
}

interface DownloadReportResponse {
  reportId: string;
  downloadUrl: string;
  expiresAt: string;
  fileName: string;
  type: string;
  summary: string | null;
  totalCost: number | null;
  generatedAt: string;
}

export const reportKeys = {
  all: ["reports"] as const,
  download: (id: string) => [...reportKeys.all, "download", id] as const,
};

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GenerateReportPayload) =>
      api.post<GenerateReportResponse>("/reports", {
        inspectionId: payload.inspectionId,
        type: payload.type.toLowerCase(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}

export function useReportDownload(reportId: string | null) {
  return useQuery({
    queryKey: reportKeys.download(reportId ?? ""),
    queryFn: () =>
      api.get<DownloadReportResponse>(`/reports/${reportId}/download`),
    enabled: false, // manual trigger only
  });
}

export function triggerPdfDownload(url: string, fileName: string) {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
