"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function LandingNav() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <div className="bg-muted h-8 w-16 animate-pulse rounded" />
        <div className="bg-muted h-8 w-24 animate-pulse rounded" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-semibold"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/login"
        className="text-muted-foreground hover:text-foreground text-sm font-medium"
      >
        Sign in
      </Link>
      <Link
        href="/register"
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-semibold"
      >
        Get Started
      </Link>
    </div>
  );
}
