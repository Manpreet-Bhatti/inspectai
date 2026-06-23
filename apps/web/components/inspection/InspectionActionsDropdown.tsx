"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Copy, FileDown, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";

interface Props {
  inspection: {
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    property_type: string | null;
  };
}

export function InspectionActionsDropdown({ inspection }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<
    "duplicate" | "export" | "delete" | null
  >(null);

  async function handleDuplicate() {
    setLoading("duplicate");
    try {
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Copy of ${inspection.title}`,
          address: inspection.address,
          city: inspection.city,
          state: inspection.state,
          zipCode: inspection.zip_code,
          propertyType: inspection.property_type ?? "residential",
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      router.push(`/inspections/${data.id}`);
    } catch {
      alert("Failed to duplicate inspection");
      setLoading(null);
    }
  }

  async function handleExportPDF() {
    setLoading("export");
    try {
      const genRes = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inspectionId: inspection.id, type: "full" }),
      });
      if (!genRes.ok) throw new Error();
      const report = await genRes.json();

      const dlRes = await fetch(`/api/reports/${report.id}/download`);
      if (!dlRes.ok) throw new Error();
      const { downloadUrl } = await dlRes.json();

      window.open(downloadUrl, "_blank");
    } catch {
      alert("Failed to export PDF");
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${inspection.title}"? This cannot be undone.`))
      return;
    setLoading("delete");
    try {
      const res = await fetch(`/api/inspections/${inspection.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert("Failed to delete inspection");
      setLoading(null);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors">
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={handleDuplicate}
          disabled={loading === "duplicate"}
        >
          <Copy className="mr-2 h-4 w-4" />
          {loading === "duplicate" ? "Duplicating..." : "Duplicate"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleExportPDF}
          disabled={loading === "export"}
        >
          <FileDown className="mr-2 h-4 w-4" />
          {loading === "export" ? "Exporting..." : "Export PDF"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={loading === "delete"}
          className="text-destructive focus:text-destructive hover:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {loading === "delete" ? "Deleting..." : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
