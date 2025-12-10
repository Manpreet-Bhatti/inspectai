/**
 * Type definitions for the InspectAI application
 */

// User types
export type Role = "INSPECTOR" | "MANAGER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  organizationId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Inspection types
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

export interface Inspection {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: PropertyType;
  status: InspectionStatus;
  userId: string;
  scheduledAt: Date | null;
  completedAt: Date | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  photos?: Photo[];
  voiceNotes?: VoiceNote[];
  findings?: Finding[];
  reports?: Report[];
  _count?: {
    photos: number;
    voiceNotes: number;
    findings: number;
  };
}

// Photo types
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

export interface Photo {
  id: string;
  inspectionId: string;
  fileName: string;
  originalUrl: string;
  thumbnailUrl: string | null;
  category: PhotoCategory;
  location: string | null;
  width: number | null;
  height: number | null;
  aiCaption: string | null;
  aiObjects: AIObject[] | null;
  aiCondition: string | null;
  aiConfidence: number | null;
  processedAt: Date | null;
  error: string | null;
  createdAt: Date;
}

export interface AIObject {
  label: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

// Voice note types
export interface VoiceNote {
  id: string;
  inspectionId: string;
  audioUrl: string;
  duration: number;
  transcript: string | null;
  summary: string | null;
  processedAt: Date | null;
  error: string | null;
  createdAt: Date;
}

// Finding types
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

export interface Finding {
  id: string;
  inspectionId: string;
  photoId: string | null;
  voiceNoteId: string | null;
  title: string;
  description: string;
  category: FindingCategory;
  severity: Severity;
  location: string | null;
  costEstimate: number | null;
  costMin: number | null;
  costMax: number | null;
  status: FindingStatus;
  isAiGenerated: boolean;
  confidence: number | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  photo?: Photo;
  voiceNote?: VoiceNote;
}

export interface SimilarFinding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: FindingCategory;
  similarity: number;
  inspectionId: string;
  inspectionTitle: string;
}

// Report types
export type ReportType = "FULL" | "SUMMARY" | "DEFECTS";

export interface Report {
  id: string;
  inspectionId: string;
  type: ReportType;
  fileUrl: string | null;
  summary: string | null;
  totalCost: number | null;
  generatedAt: Date;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  status?: number;
}

// Form types
export interface InspectionFormData {
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: PropertyType;
  notes?: string;
}

export interface FindingFormData {
  title: string;
  description: string;
  category: FindingCategory;
  severity: Severity;
  location?: string;
  costEstimate?: number;
  costMin?: number;
  costMax?: number;
  photoId?: string;
}

// Filter types
export interface InspectionFilters {
  status?: InspectionStatus;
  propertyType?: PropertyType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface FindingFilters {
  category?: FindingCategory;
  severity?: Severity;
  status?: FindingStatus;
  search?: string;
}
