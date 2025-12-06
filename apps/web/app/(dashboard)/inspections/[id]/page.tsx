import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Mic,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  MapPin,
  Building2,
  Calendar,
  MoreVertical,
} from "lucide-react";

const inspection = {
  id: "1",
  title: "123 Oak Street Inspection",
  address: "123 Oak Street",
  city: "Springfield",
  state: "IL",
  zipCode: "62701",
  propertyType: "Single Family",
  status: "in_progress",
  createdAt: "2024-01-15",
  scheduledAt: "2024-01-15T10:00:00",
  completedAt: null,
  photosCount: 23,
  voiceNotesCount: 5,
  findingsCount: 8,
};

const recentFindings = [
  {
    id: "1",
    title: "Water damage on ceiling",
    category: "STRUCTURAL",
    severity: "MAJOR",
    location: "Living Room",
  },
  {
    id: "2",
    title: "Outdated electrical panel",
    category: "ELECTRICAL",
    severity: "CRITICAL",
    location: "Basement",
  },
  {
    id: "3",
    title: "Minor crack in foundation",
    category: "STRUCTURAL",
    severity: "MINOR",
    location: "Foundation",
  },
];

function getSeverityBadge(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return (
        <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
          Critical
        </span>
      );
    case "MAJOR":
      return (
        <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-400">
          Major
        </span>
      );
    case "MINOR":
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
          Minor
        </span>
      );
    default:
      return (
        <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
          {severity}
        </span>
      );
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          Completed
        </span>
      );
    case "in_progress":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400">
          <Clock className="h-4 w-4" />
          In Progress
        </span>
      );
    default:
      return (
        <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-3 py-1 text-sm font-medium">
          {status}
        </span>
      );
  }
}

export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // TODO: Fetch inspection data based on id
  console.log("Inspection ID:", id);

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/inspections"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to inspections
      </Link>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              {inspection.title}
            </h1>
            {getStatusBadge(inspection.status)}
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {inspection.address}, {inspection.city}, {inspection.state}{" "}
              {inspection.zipCode}
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {inspection.propertyType}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {inspection.createdAt}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="border-input bg-background text-foreground hover:bg-muted rounded-lg border px-4 py-2 text-sm font-medium">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href={`/inspections/${id}/photos`}
          className="border-border bg-card hover:bg-muted/50 flex items-center gap-4 rounded-xl border p-4 transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
            <Camera className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-foreground text-2xl font-bold">
              {inspection.photosCount}
            </p>
            <p className="text-muted-foreground text-sm">Photos</p>
          </div>
        </Link>

        <div className="border-border bg-card flex items-center gap-4 rounded-xl border p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
            <Mic className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-foreground text-2xl font-bold">
              {inspection.voiceNotesCount}
            </p>
            <p className="text-muted-foreground text-sm">Voice Notes</p>
          </div>
        </div>

        <Link
          href={`/inspections/${id}/findings`}
          className="border-border bg-card hover:bg-muted/50 flex items-center gap-4 rounded-xl border p-4 transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-foreground text-2xl font-bold">
              {inspection.findingsCount}
            </p>
            <p className="text-muted-foreground text-sm">Findings</p>
          </div>
        </Link>

        <Link
          href={`/inspections/${id}/report`}
          className="border-border bg-card hover:bg-muted/50 flex items-center gap-4 rounded-xl border p-4 transition-colors"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
            <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-foreground text-sm font-medium">Generate</p>
            <p className="text-muted-foreground text-sm">Report</p>
          </div>
        </Link>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Findings */}
        <div className="border-border bg-card rounded-xl border shadow-sm">
          <div className="border-border flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-foreground text-lg font-semibold">
              Recent Findings
            </h2>
            <Link
              href={`/inspections/${id}/findings`}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          <div className="divide-border divide-y">
            {recentFindings.map((finding) => (
              <div key={finding.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-foreground font-medium">
                      {finding.title}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {finding.category} · {finding.location}
                    </p>
                  </div>
                  {getSeverityBadge(finding.severity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-4">
          <div className="border-border bg-card rounded-xl border border-dashed p-6">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                <Camera className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-foreground mt-4 font-semibold">
                Upload Photos
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Drag and drop photos here, or click to select
              </p>
              <Link
                href={`/inspections/${id}/photos`}
                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 rounded-lg px-4 py-2 text-sm font-semibold"
              >
                Upload Photos
              </Link>
            </div>
          </div>

          <div className="border-border bg-card rounded-xl border border-dashed p-6">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                <Mic className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-foreground mt-4 font-semibold">
                Record Voice Note
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Record observations and notes hands-free
              </p>
              <button className="border-input bg-background text-foreground hover:bg-muted mt-4 rounded-lg border px-4 py-2 text-sm font-medium">
                Start Recording
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
