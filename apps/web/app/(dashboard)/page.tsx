import Link from "next/link";
import {
  Plus,
  ClipboardList,
  Camera,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const stats = [
  {
    label: "Total Inspections",
    value: "24",
    change: "+12%",
    changeType: "positive" as const,
    icon: ClipboardList,
  },
  {
    label: "Photos Analyzed",
    value: "1,284",
    change: "+23%",
    changeType: "positive" as const,
    icon: Camera,
  },
  {
    label: "Reports Generated",
    value: "18",
    change: "+8%",
    changeType: "positive" as const,
    icon: FileText,
  },
  {
    label: "Issues Detected",
    value: "156",
    change: "-5%",
    changeType: "negative" as const,
    icon: AlertCircle,
  },
];

const recentInspections = [
  {
    id: "1",
    title: "123 Oak Street",
    status: "completed",
    date: "2024-01-15",
    findings: 8,
  },
  {
    id: "2",
    title: "456 Maple Avenue",
    status: "in_progress",
    date: "2024-01-14",
    findings: 3,
  },
  {
    id: "3",
    title: "789 Pine Road",
    status: "draft",
    date: "2024-01-13",
    findings: 0,
  },
  {
    id: "4",
    title: "321 Elm Boulevard",
    status: "review",
    date: "2024-01-12",
    findings: 12,
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

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your inspections.
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

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-border bg-card rounded-xl border p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                <stat.icon className="text-primary h-5 w-5" />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  stat.changeType === "positive"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                <TrendingUp
                  className={`h-4 w-4 ${
                    stat.changeType === "negative" ? "rotate-180" : ""
                  }`}
                />
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-foreground text-2xl font-bold">{stat.value}</p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Inspections */}
      <div className="border-border bg-card rounded-xl border shadow-sm">
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-foreground text-lg font-semibold">
            Recent Inspections
          </h2>
          <Link
            href="/inspections"
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            View all
          </Link>
        </div>
        <div className="divide-border divide-y">
          {recentInspections.map((inspection) => (
            <Link
              key={inspection.id}
              href={`/inspections/${inspection.id}`}
              className="hover:bg-muted/50 flex items-center justify-between px-6 py-4 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <span className="text-foreground font-medium">
                  {inspection.title}
                </span>
                <span className="text-muted-foreground text-sm">
                  {inspection.date} · {inspection.findings} findings
                </span>
              </div>
              {getStatusBadge(inspection.status)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
