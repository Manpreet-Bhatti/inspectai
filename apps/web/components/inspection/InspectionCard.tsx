"use client";

import Link from "next/link";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  FileText,
  MapPin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Inspection } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

interface InspectionCardProps {
  inspection: Inspection;
  onClick?: () => void;
}

function getStatusBadge(status: Inspection["status"]) {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge className="border-0 bg-green-500/10 text-green-600 dark:text-green-400">
          <CheckCircle className="mr-1 h-3 w-3" />
          Completed
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge className="border-0 bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Clock className="mr-1 h-3 w-3" />
          In Progress
        </Badge>
      );
    case "REVIEW":
      return (
        <Badge className="border-0 bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <AlertCircle className="mr-1 h-3 w-3" />
          Review
        </Badge>
      );
    case "DRAFT":
    default:
      return <Badge variant="secondary">Draft</Badge>;
  }
}

export function InspectionCard({ inspection, onClick }: InspectionCardProps) {
  const content = (
    <Card className="hover:border-muted-foreground/50 cursor-pointer transition-all hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              {getStatusBadge(inspection.status)}
              <span className="text-muted-foreground text-xs">
                {formatRelativeTime(inspection.createdAt)}
              </span>
            </div>

            <h3 className="text-foreground mb-1 truncate font-semibold">
              {inspection.title}
            </h3>

            <div className="text-muted-foreground mb-3 flex items-center gap-1 text-sm">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {inspection.address}, {inspection.city}, {inspection.state}
              </span>
            </div>

            <div className="text-muted-foreground flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Camera className="h-4 w-4" />
                {inspection._count?.photos ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {inspection._count?.findings ?? 0}
              </span>
              <span className="bg-muted rounded px-2 py-0.5 text-xs">
                {inspection.propertyType.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  return <Link href={`/inspections/${inspection.id}`}>{content}</Link>;
}
