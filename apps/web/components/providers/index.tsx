"use client";

import { type ReactNode } from "react";
import { QueryProvider } from "./QueryProvider";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Root providers wrapper component
 * Combines all context providers needed for the application
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      {/* Add more providers here:
          - SessionProvider for NextAuth
          - ThemeProvider for dark mode
          - ToastProvider for notifications
      */}
      {children}
    </QueryProvider>
  );
}
