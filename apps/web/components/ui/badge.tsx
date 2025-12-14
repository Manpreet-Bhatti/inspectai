import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "info";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground shadow",
    secondary: "border-transparent bg-secondary text-secondary-foreground",
    destructive:
      "border-transparent bg-destructive text-destructive-foreground shadow",
    outline: "text-foreground",
    success:
      "border-transparent bg-green-500/10 text-green-600 dark:text-green-400",
    warning:
      "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
    info: "border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };

  return (
    <div
      className={cn(
        "focus:ring-ring inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
