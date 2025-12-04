// Shared constants

export const SEVERITY_COLORS = {
  CRITICAL: "#dc2626",
  MAJOR: "#ea580c",
  MINOR: "#ca8a04",
  COSMETIC: "#2563eb",
  INFO: "#6b7280",
} as const;

export const SEVERITY_LABELS = {
  CRITICAL: "Critical",
  MAJOR: "Major",
  MINOR: "Minor",
  COSMETIC: "Cosmetic",
  INFO: "Informational",
} as const;

export const PROPERTY_TYPE_LABELS = {
  SINGLE_FAMILY: "Single Family",
  MULTI_FAMILY: "Multi-Family",
  CONDO: "Condominium",
  TOWNHOUSE: "Townhouse",
  COMMERCIAL: "Commercial",
  INDUSTRIAL: "Industrial",
} as const;

export const INSPECTION_STATUS_LABELS = {
  DRAFT: "Draft",
  IN_PROGRESS: "In Progress",
  REVIEW: "Under Review",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
} as const;

export const MAX_PHOTO_SIZE_MB = 10;
export const MAX_VOICE_NOTE_DURATION_SECONDS = 300;
export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const SUPPORTED_AUDIO_TYPES = ["audio/webm", "audio/mp4", "audio/mpeg"];
