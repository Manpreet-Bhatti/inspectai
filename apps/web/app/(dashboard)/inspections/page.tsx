import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  FileText,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type InspectionWithCounts = {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: string | null;
  status: string | null;
  created_at: string | null;
  completed_at: string | null;
  photosCount: number;
  findingsCount: number;
};

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
          <CheckCircle className="h-3 w-3" />
          Completed
        </span>
      );
    case "in_progress":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
          <Clock className="h-3 w-3" />
          In Progress
        </span>
      );
    case "review":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-3 w-3" />
          Review
        </span>
      );
    default:
      return (
        <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
          Draft
        </span>
      );
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPropertyType(type: string | null): string {
  if (!type) return "N/A";
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default async function InspectionsPage() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch inspections
  const { data: inspections, count } = (await supabase
    .from("inspections")
    .select("id, title, address, city, state, zip_code, property_type, status, created_at, completed_at", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })) as {
    data: {
      id: string;
      title: string;
      address: string;
      city: string;
      state: string;
      zip_code: string;
      property_type: string | null;
      status: string | null;
      created_at: string | null;
      completed_at: string | null;
    }[] | null;
    count: number | null;
  };

  // Get counts for each inspection
  const inspectionsWithCounts: InspectionWithCounts[] = await Promise.all(
    (inspections || []).map(async (inspection) => {
      const [photosResult, findingsResult] = await Promise.all([
        supabase
          .from("photos")
          .select("*", { count: "exact", head: true })
          .eq("inspection_id", inspection.id),
        supabase
          .from("findings")
          .select("*", { count: "exact", head: true })
          .eq("inspection_id", inspection.id),
      ]);

      return {
        ...inspection,
        photosCount: photosResult.count || 0,
        findingsCount: findingsResult.count || 0,
      };
    })
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Inspections
          </h1>
          <p className="text-muted-foreground">
            Manage and track all your property inspections.
          </p>
        </div>
        <Link
          href="/inspections/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          New Inspection
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inspections..."
            className="border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary w-full rounded-lg border py-2 pl-10 pr-4 focus:outline-none focus:ring-1"
          />
        </div>
        <div className="flex gap-2">
          <select className="border-input bg-background text-foreground focus:border-primary focus:ring-primary rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
          <select className="border-input bg-background text-foreground focus:border-primary focus:ring-primary rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1">
            <option value="">All Property Types</option>
            <option value="single_family">Single Family</option>
            <option value="multi_family">Multi Family</option>
            <option value="condo">Condo</option>
            <option value="townhouse">Townhouse</option>
            <option value="commercial">Commercial</option>
          </select>
          <button className="border-input bg-background text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <Filter className="h-4 w-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Empty State */}
      {inspectionsWithCounts.length === 0 ? (
        <div className="border-border bg-card flex flex-col items-center justify-center rounded-xl border p-12 text-center">
          <div className="bg-muted rounded-full p-4">
            <FileText className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="text-foreground mt-4 text-lg font-semibold">
            No inspections yet
          </h3>
          <p className="text-muted-foreground mt-1 max-w-sm">
            Create your first inspection to start documenting properties.
          </p>
          <Link
            href="/inspections/new"
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            New Inspection
          </Link>
        </div>
      ) : (
        <>
          {/* Inspections List */}
          <div className="border-border bg-card rounded-xl border shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-border bg-muted/50 border-b">
                    <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Property
                    </th>
                    <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Photos
                    </th>
                    <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Findings
                    </th>
                    <th className="text-muted-foreground px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-muted-foreground px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {inspectionsWithCounts.map((inspection) => (
                    <tr
                      key={inspection.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/inspections/${inspection.id}`}
                          className="block"
                        >
                          <p className="text-foreground hover:text-primary font-medium">
                            {inspection.title}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {inspection.address}, {inspection.city}, {inspection.state} {inspection.zip_code}
                          </p>
                        </Link>
                      </td>
                      <td className="text-muted-foreground px-6 py-4 text-sm">
                        {formatPropertyType(inspection.property_type)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(inspection.status || "draft")}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
                          <Camera className="h-4 w-4" />
                          {inspection.photosCount}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
                          <FileText className="h-4 w-4" />
                          {inspection.findingsCount}
                        </span>
                      </td>
                      <td className="text-muted-foreground px-6 py-4 text-sm">
                        {formatDate(inspection.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-border flex items-center justify-between border-t px-6 py-4">
              <p className="text-muted-foreground text-sm">
                Showing {inspectionsWithCounts.length} of {count || 0} inspections
              </p>
              <div className="flex gap-2">
                <button
                  disabled
                  className="border-input bg-background text-muted-foreground rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <button className="border-input bg-background text-foreground hover:bg-muted rounded-lg border px-3 py-1.5 text-sm">
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
