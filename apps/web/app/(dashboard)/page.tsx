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
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    label: "Total Inspections",
    value: "24",
    change: "+12%",
    changeType: "positive" as const,
    icon: ClipboardList,
    description: "from last month",
  },
  {
    label: "Photos Analyzed",
    value: "1,284",
    change: "+23%",
    changeType: "positive" as const,
    icon: Camera,
    description: "AI-processed images",
  },
  {
    label: "Reports Generated",
    value: "18",
    change: "+8%",
    changeType: "positive" as const,
    icon: FileText,
    description: "completed reports",
  },
  {
    label: "Issues Detected",
    value: "156",
    change: "-5%",
    changeType: "negative" as const,
    icon: AlertCircle,
    description: "identified problems",
  },
];

const recentInspections = [
  {
    id: "1",
    title: "123 Oak Street",
    address: "San Francisco, CA",
    status: "completed",
    date: "2024-01-15",
    findings: 8,
  },
  {
    id: "2",
    title: "456 Maple Avenue",
    address: "Los Angeles, CA",
    status: "in_progress",
    date: "2024-01-14",
    findings: 3,
  },
  {
    id: "3",
    title: "789 Pine Road",
    address: "Seattle, WA",
    status: "draft",
    date: "2024-01-13",
    findings: 0,
  },
  {
    id: "4",
    title: "321 Elm Boulevard",
    address: "Portland, OR",
    status: "review",
    date: "2024-01-12",
    findings: 12,
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Completed
        </Badge>
      );
    case "in_progress":
      return (
        <Badge variant="info" className="gap-1">
          <Clock className="h-3 w-3" />
          In Progress
        </Badge>
      );
    case "review":
      return (
        <Badge variant="warning" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Review
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1">
          Draft
        </Badge>
      );
  }
}

function StatCard({
  stat,
}: {
  stat: {
    label: string;
    value: string;
    change: string;
    changeType: "positive" | "negative";
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  };
}) {
  const Icon = stat.icon;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
        <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
          <Icon className="text-primary h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stat.value}</div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`flex items-center gap-1 font-medium ${
              stat.changeType === "positive"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            <TrendingUp
              className={`h-3 w-3 ${
                stat.changeType === "negative" ? "rotate-180" : ""
              }`}
            />
            {stat.change}
          </span>
          <span className="text-muted-foreground">{stat.description}</span>
        </div>
      </CardContent>
    </Card>
  );
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
        <Button asChild>
          <Link href="/inspections/new">
            <Plus className="mr-2 h-4 w-4" />
            New Inspection
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Recent Inspections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Inspections</CardTitle>
            <CardDescription>
              Your latest property inspection activities
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/inspections">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
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
                    {inspection.address}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {inspection.date} &middot; {inspection.findings} findings
                  </span>
                </div>
                {getStatusBadge(inspection.status)}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-primary/50 cursor-pointer transition-colors">
          <Link href="/inspections/new">
            <CardHeader>
              <div className="bg-primary/10 mb-2 flex h-12 w-12 items-center justify-center rounded-lg">
                <Plus className="text-primary h-6 w-6" />
              </div>
              <CardTitle className="text-base">Start New Inspection</CardTitle>
              <CardDescription>
                Begin a new property inspection with AI-powered analysis
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:border-primary/50 cursor-pointer transition-colors">
          <Link href="/inspections">
            <CardHeader>
              <div className="bg-primary/10 mb-2 flex h-12 w-12 items-center justify-center rounded-lg">
                <ClipboardList className="text-primary h-6 w-6" />
              </div>
              <CardTitle className="text-base">View All Inspections</CardTitle>
              <CardDescription>
                Browse and manage all your inspection records
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:border-primary/50 cursor-pointer transition-colors">
          <Link href="/settings">
            <CardHeader>
              <div className="bg-primary/10 mb-2 flex h-12 w-12 items-center justify-center rounded-lg">
                <FileText className="text-primary h-6 w-6" />
              </div>
              <CardTitle className="text-base">Generate Report</CardTitle>
              <CardDescription>
                Create comprehensive inspection reports
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </div>
  );
}
