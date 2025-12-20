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
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
    changeType: "positive" | "negative" | "neutral";
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
          {stat.changeType !== "neutral" && (
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
          )}
          <span className="text-muted-foreground">{stat.description}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Fetch recent inspections with findings count
  type RecentInspection = {
    id: string;
    title: string;
    address: string;
    city: string;
    state: string;
    status: string | null;
    created_at: string | null;
  };

  const { data: recentInspections } = (await supabase
    .from("inspections")
    .select("id, title, address, city, state, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(4)) as { data: RecentInspection[] | null };

  // Get findings counts for each inspection
  const inspectionsWithFindings = await Promise.all(
    (recentInspections || []).map(async (inspection: RecentInspection) => {
      const { count } = await supabase
        .from("findings")
        .select("*", { count: "exact", head: true })
        .eq("inspection_id", inspection.id);

      return {
        ...inspection,
        findingsCount: count || 0,
      };
    })
  );

  // Fetch stats
  const [inspectionsCount, photosCount, reportsCount, findingsCount] =
    await Promise.all([
      supabase
        .from("inspections")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("photos")
        .select("*, inspections!inner(user_id)", { count: "exact", head: true })
        .eq("inspections.user_id", user.id),
      supabase
        .from("reports")
        .select("*, inspections!inner(user_id)", { count: "exact", head: true })
        .eq("inspections.user_id", user.id),
      supabase
        .from("findings")
        .select("*, inspections!inner(user_id)", { count: "exact", head: true })
        .eq("inspections.user_id", user.id),
    ]);

  const stats = [
    {
      label: "Total Inspections",
      value: String(inspectionsCount.count || 0),
      change: "",
      changeType: "neutral" as const,
      icon: ClipboardList,
      description: "all time",
    },
    {
      label: "Photos Uploaded",
      value: String(photosCount.count || 0),
      change: "",
      changeType: "neutral" as const,
      icon: Camera,
      description: "total images",
    },
    {
      label: "Reports Generated",
      value: String(reportsCount.count || 0),
      change: "",
      changeType: "neutral" as const,
      icon: FileText,
      description: "completed reports",
    },
    {
      label: "Issues Detected",
      value: String(findingsCount.count || 0),
      change: "",
      changeType: "neutral" as const,
      icon: AlertCircle,
      description: "identified findings",
    },
  ];

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
          {inspectionsWithFindings.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-muted-foreground">No inspections yet.</p>
              <Button asChild className="mt-4">
                <Link href="/inspections/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first inspection
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-border divide-y">
              {inspectionsWithFindings.map((inspection) => (
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
                      {inspection.city}, {inspection.state}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(inspection.created_at)} &middot;{" "}
                      {inspection.findingsCount} findings
                    </span>
                  </div>
                  {getStatusBadge(inspection.status || "draft")}
                </Link>
              ))}
            </div>
          )}
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
