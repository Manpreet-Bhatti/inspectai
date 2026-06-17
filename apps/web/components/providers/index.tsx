"use client";

import { useEffect, type ReactNode } from "react";
import { QueryProvider } from "./QueryProvider";
import { OfflineBanner } from "@/components/OfflineBanner";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <QueryProvider>
      {children}
      <OfflineBanner />
    </QueryProvider>
  );
}
