/**
 * Validation schemas and utilities
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation (minimum 8 characters, at least one letter and one number)
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

export function isValidPostalCode(postalCode: string): boolean {
  const postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
  return postalRegex.test(postalCode);
}

export function isValidProvince(province: string): boolean {
  const provinces = [
    "AB",
    "BC",
    "MB",
    "NB",
    "NL",
    "NS",
    "NT",
    "NU",
    "ON",
    "PE",
    "QC",
    "SK",
    "YT",
  ];
  return provinces.includes(province.toUpperCase());
}

// Inspection form validation
export interface InspectionFormData {
  title: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateInspectionForm(
  data: InspectionFormData
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.title || data.title.trim().length < 3) {
    errors.push({
      field: "title",
      message: "Title must be at least 3 characters",
    });
  }

  if (!data.address || data.address.trim().length < 5) {
    errors.push({
      field: "address",
      message: "Please enter a valid street address",
    });
  }

  if (!data.city || data.city.trim().length < 2) {
    errors.push({
      field: "city",
      message: "Please enter a valid city",
    });
  }

  if (!isValidProvince(data.state)) {
    errors.push({
      field: "state",
      message: "Please enter a valid Canadian province abbreviation",
    });
  }

  if (!isValidPostalCode(data.zipCode)) {
    errors.push({
      field: "zipCode",
      message: "Please enter a valid postal code (e.g., A1A 1A1)",
    });
  }

  const validPropertyTypes = [
    "SINGLE_FAMILY",
    "MULTI_FAMILY",
    "CONDO",
    "TOWNHOUSE",
    "COMMERCIAL",
    "INDUSTRIAL",
  ];

  if (!validPropertyTypes.includes(data.propertyType)) {
    errors.push({
      field: "propertyType",
      message: "Please select a property type",
    });
  }

  return errors;
}

// Finding form validation
export interface FindingFormData {
  title: string;
  description: string;
  category: string;
  severity: string;
  location?: string;
  costEstimate?: number;
}

export function validateFindingForm(data: FindingFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.title || data.title.trim().length < 5) {
    errors.push({
      field: "title",
      message: "Title must be at least 5 characters",
    });
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push({
      field: "description",
      message: "Description must be at least 10 characters",
    });
  }

  const validCategories = [
    "STRUCTURAL",
    "ELECTRICAL",
    "PLUMBING",
    "HVAC",
    "ROOFING",
    "EXTERIOR",
    "INTERIOR",
    "APPLIANCES",
    "SAFETY",
    "COSMETIC",
  ];

  if (!validCategories.includes(data.category)) {
    errors.push({
      field: "category",
      message: "Please select a valid category",
    });
  }

  const validSeverities = ["CRITICAL", "MAJOR", "MINOR", "COSMETIC", "INFO"];

  if (!validSeverities.includes(data.severity)) {
    errors.push({
      field: "severity",
      message: "Please select a valid severity",
    });
  }

  if (data.costEstimate !== undefined && data.costEstimate < 0) {
    errors.push({
      field: "costEstimate",
      message: "Cost estimate cannot be negative",
    });
  }

  return errors;
}

export function isValidImageFile(file: File): boolean {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
  ];
  return validTypes.includes(file.type);
}

export function isValidAudioFile(file: File): boolean {
  const validTypes = [
    "audio/webm",
    "audio/mp3",
    "audio/mpeg",
    "audio/wav",
    "audio/m4a",
  ];
  return validTypes.includes(file.type);
}

export function isFileSizeValid(file: File, maxSizeMB: number): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}
