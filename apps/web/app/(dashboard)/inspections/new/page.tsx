"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

const propertyTypes = [
  {
    value: "SINGLE_FAMILY",
    label: "Single Family",
    description: "Detached single-family home",
  },
  {
    value: "MULTI_FAMILY",
    label: "Multi Family",
    description: "Duplex, triplex, or apartment building",
  },
  { value: "CONDO", label: "Condo", description: "Condominium unit" },
  {
    value: "TOWNHOUSE",
    label: "Townhouse",
    description: "Attached townhouse or row house",
  },
  {
    value: "COMMERCIAL",
    label: "Commercial",
    description: "Office, retail, or commercial space",
  },
  {
    value: "INDUSTRIAL",
    label: "Industrial",
    description: "Warehouse or industrial property",
  },
];

export default function NewInspectionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    propertyType: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Implement actual API call
    console.log("Creating inspection:", formData);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    router.push("/inspections/1");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Back Link */}
      <Link
        href="/inspections"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to inspections
      </Link>

      {/* Page Header */}
      <div>
        <h1 className="text-foreground text-2xl font-bold tracking-tight">
          New Inspection
        </h1>
        <p className="text-muted-foreground">
          Create a new property inspection to get started.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Property Details */}
        <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="text-foreground mb-4 text-lg font-semibold">
            Property Details
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="text-foreground block text-sm font-medium"
              >
                Inspection Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., 123 Oak Street Inspection"
                className="border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="text-foreground block text-sm font-medium"
              >
                Street Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Oak Street"
                className="border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="city"
                  className="text-foreground block text-sm font-medium"
                >
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Springfield"
                  className="border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
                />
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="text-foreground block text-sm font-medium"
                >
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="IL"
                  maxLength={2}
                  className="border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
                />
              </div>
              <div>
                <label
                  htmlFor="zipCode"
                  className="text-foreground block text-sm font-medium"
                >
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  required
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="62701"
                  maxLength={10}
                  className="border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Property Type */}
        <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="text-foreground mb-4 text-lg font-semibold">
            Property Type
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            {propertyTypes.map((type) => (
              <label
                key={type.value}
                className={`relative flex cursor-pointer rounded-lg border p-4 transition-colors ${
                  formData.propertyType === type.value
                    ? "border-primary bg-primary/5"
                    : "border-input hover:border-muted-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="propertyType"
                  value={type.value}
                  checked={formData.propertyType === type.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
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
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
          <h2 className="text-foreground mb-4 text-lg font-semibold">
            Additional Notes
          </h2>

          <div>
            <label
              htmlFor="notes"
              className="text-foreground block text-sm font-medium"
            >
              Notes (optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional details about the property or inspection requirements..."
              className="border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link
            href="/inspections"
            className="border-input bg-background text-foreground hover:bg-muted rounded-lg border px-4 py-2 text-sm font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !formData.propertyType}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Inspection"}
          </button>
        </div>
      </form>
    </div>
  );
}
