"use client";

import { type ReactNode } from "react";
import { QueryProvider } from "./QueryProvider";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Root providers wrapper component
 * Combines all context providers needed for the application
 *
 * Note: Supabase auth is managed via cookies and doesn't need a context provider.
 * Auth state is accessed via the useAuth hook which creates a Supabase client.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      {/* Add more providers here:
          - ThemeProvider for dark mode
          - ToastProvider for notifications
      */}
      {children}
    </QueryProvider>
  );
}
