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

const inspections = [
  {
    id: "1",
    title: "123 Oak Street Inspection",
    address: "123 Oak Street, Springfield, IL 62701",
    propertyType: "Single Family",
    status: "completed",
    createdAt: "2024-01-15",
    completedAt: "2024-01-15",
    photosCount: 45,
    findingsCount: 8,
  },
  {
    id: "2",
    title: "456 Maple Avenue Inspection",
    address: "456 Maple Avenue, Chicago, IL 60601",
    propertyType: "Condo",
    status: "in_progress",
    createdAt: "2024-01-14",
    completedAt: null,
    photosCount: 23,
    findingsCount: 3,
  },
  {
    id: "3",
    title: "789 Pine Road Inspection",
    address: "789 Pine Road, Naperville, IL 60540",
    propertyType: "Townhouse",
    status: "draft",
    createdAt: "2024-01-13",
    completedAt: null,
    photosCount: 0,
    findingsCount: 0,
  },
  {
    id: "4",
    title: "321 Elm Boulevard Inspection",
    address: "321 Elm Boulevard, Evanston, IL 60201",
    propertyType: "Multi Family",
    status: "review",
    createdAt: "2024-01-12",
    completedAt: null,
    photosCount: 67,
    findingsCount: 12,
  },
  {
    id: "5",
    title: "555 Cedar Lane Inspection",
    address: "555 Cedar Lane, Oak Park, IL 60302",
    propertyType: "Commercial",
    status: "completed",
    createdAt: "2024-01-10",
    completedAt: "2024-01-11",
    photosCount: 89,
    findingsCount: 15,
  },
];

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

export default function InspectionsPage() {
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
              {inspections.map((inspection) => (
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
                        {inspection.address}
                      </p>
                    </Link>
                  </td>
                  <td className="text-muted-foreground px-6 py-4 text-sm">
                    {inspection.propertyType}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(inspection.status)}
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
                    {inspection.createdAt}
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
            Showing 1-5 of 24 inspections
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
    </div>
  );
}
