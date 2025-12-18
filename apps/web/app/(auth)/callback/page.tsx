"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();
      const next = searchParams.get("next") || "/";
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (errorParam) {
        setError(errorDescription || errorParam);
        return;
      }

      const { error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      router.push(next);
      router.refresh();
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="mx-auto w-full max-w-md space-y-8 p-8 text-center">
          <div className="bg-destructive/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <svg
              className="text-destructive h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-foreground text-2xl font-bold">
            Authentication Error
          </h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-8 p-8 text-center">
        <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
          <svg
            className="text-primary h-8 w-8 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <h1 className="text-foreground text-2xl font-bold">
          Completing sign in...
        </h1>
        <p className="text-muted-foreground">
          Please wait while we verify your account.
        </p>
      </div>
    </div>
  );
}
