// Shared types between frontend and backend

export type PropertyType =
  | "SINGLE_FAMILY"
  | "MULTI_FAMILY"
  | "CONDO"
  | "TOWNHOUSE"
  | "COMMERCIAL"
  | "INDUSTRIAL";

export type InspectionStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "REVIEW"
  | "COMPLETED"
  | "ARCHIVED";

export type PhotoCategory =
  | "EXTERIOR"
  | "INTERIOR"
  | "ROOF"
  | "FOUNDATION"
  | "ELECTRICAL"
  | "PLUMBING"
  | "HVAC"
  | "STRUCTURAL"
  | "OTHER";

export type FindingCategory =
  | "STRUCTURAL"
  | "ELECTRICAL"
  | "PLUMBING"
  | "HVAC"
  | "ROOFING"
  | "EXTERIOR"
  | "INTERIOR"
  | "APPLIANCES"
  | "SAFETY"
  | "COSMETIC";

export type Severity = "CRITICAL" | "MAJOR" | "MINOR" | "COSMETIC" | "INFO";

export type FindingStatus = "ACTIVE" | "RESOLVED" | "DISPUTED";

export type ReportType = "FULL" | "SUMMARY" | "DEFECTS";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
