"use client";

import { type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
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
    <SessionProvider>
      <QueryProvider>
        {/* Add more providers here:
            - ThemeProvider for dark mode
            - ToastProvider for notifications
        */}
        {children}
      </QueryProvider>
    </SessionProvider>
  );
}
