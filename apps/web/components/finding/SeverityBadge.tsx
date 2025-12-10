"use client";

import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Severity } from "@/types";

interface SeverityBadgeProps {
  severity: Severity;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const severityConfig: Record<
  Severity,
  { label: string; color: string; icon: React.ElementType }
> = {
  CRITICAL: {
    label: "Critical",
    color: "bg-red-500/10 text-red-600 dark:text-red-400",
    icon: AlertTriangle,
  },
  MAJOR: {
    label: "Major",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    icon: AlertCircle,
  },
  MINOR: {
    label: "Minor",
    color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    icon: AlertCircle,
  },
  COSMETIC: {
    label: "Cosmetic",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    icon: Info,
  },
  INFO: {
    label: "Info",
    color: "bg-muted text-muted-foreground",
    icon: Info,
  },
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-sm",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

export function SeverityBadge({
  severity,
  showIcon = true,
  size = "md",
  className,
}: SeverityBadgeProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
}

export function SeverityBadgeShowcase() {
  const severities: Severity[] = [
    "CRITICAL",
    "MAJOR",
    "MINOR",
    "COSMETIC",
    "INFO",
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {severities.map((severity) => (
        <SeverityBadge key={severity} severity={severity} />
      ))}
    </div>
  );
}
