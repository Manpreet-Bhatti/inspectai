"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { InspectionFormData, PropertyType } from "@/types";
import { validateInspectionForm } from "@/lib/validations";

interface InspectionFormProps {
  initialData?: Partial<InspectionFormData>;
  onSubmit: (data: InspectionFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const propertyTypes: {
  value: PropertyType;
  label: string;
  description: string;
}[] = [
  {
    value: "SINGLE_FAMILY",
    label: "Single Family",
    description: "Detached single-family home",
  },
  {
    value: "MULTI_FAMILY",
    label: "Multi Family",
    description: "Duplex, triplex, or apartment",
  },
  { value: "CONDO", label: "Condo", description: "Condominium unit" },
  { value: "TOWNHOUSE", label: "Townhouse", description: "Attached townhouse" },
  {
    value: "COMMERCIAL",
    label: "Commercial",
    description: "Office or retail space",
  },
  {
    value: "INDUSTRIAL",
    label: "Industrial",
    description: "Warehouse or industrial",
  },
];

export function InspectionForm({
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
}: InspectionFormProps) {
  const [formData, setFormData] = useState<InspectionFormData>({
    title: initialData.title ?? "",
    address: initialData.address ?? "",
    city: initialData.city ?? "",
    state: initialData.state ?? "",
    zipCode: initialData.zipCode ?? "",
    propertyType: initialData.propertyType ?? "SINGLE_FAMILY",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePropertyTypeChange = (value: PropertyType) => {
    setFormData((prev) => ({ ...prev, propertyType: value }));
    if (errors.propertyType) {
      setErrors((prev) => ({ ...prev, propertyType: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateInspectionForm(formData);
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Property Details */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="text-foreground mb-1 block text-sm font-medium"
          >
            Inspection Title
          </label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., 123 Oak Street Inspection"
            className={errors.title ? "border-destructive" : ""}
          />
          {errors.title && (
            <p className="text-destructive mt-1 text-sm">{errors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="address"
            className="text-foreground mb-1 block text-sm font-medium"
          >
            Street Address
          </label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Oak Street"
            className={errors.address ? "border-destructive" : ""}
          />
          {errors.address && (
            <p className="text-destructive mt-1 text-sm">{errors.address}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="city"
              className="text-foreground mb-1 block text-sm font-medium"
            >
              City
            </label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Springfield"
              className={errors.city ? "border-destructive" : ""}
            />
            {errors.city && (
              <p className="text-destructive mt-1 text-sm">{errors.city}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="state"
              className="text-foreground mb-1 block text-sm font-medium"
            >
              State
            </label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="IL"
              maxLength={2}
              className={errors.state ? "border-destructive" : ""}
            />
            {errors.state && (
              <p className="text-destructive mt-1 text-sm">{errors.state}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="zipCode"
              className="text-foreground mb-1 block text-sm font-medium"
            >
              ZIP Code
            </label>
            <Input
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              placeholder="62701"
              className={errors.zipCode ? "border-destructive" : ""}
            />
            {errors.zipCode && (
              <p className="text-destructive mt-1 text-sm">{errors.zipCode}</p>
            )}
          </div>
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="text-foreground mb-3 block text-sm font-medium">
          Property Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {propertyTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => handlePropertyTypeChange(type.value)}
              className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                formData.propertyType === type.value
                  ? "border-primary bg-primary/5"
                  : "border-input hover:border-muted-foreground"
              }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  formData.propertyType === type.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-foreground font-medium">{type.label}</p>
                <p className="text-muted-foreground text-sm">
                  {type.description}
                </p>
              </div>
            </button>
          ))}
        </div>
        {errors.propertyType && (
          <p className="text-destructive mt-1 text-sm">{errors.propertyType}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Inspection"}
        </Button>
      </div>
    </form>
  );
}
