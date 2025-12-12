"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ValidationError {
  fieldErrors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    ValidationError["fieldErrors"]
  >({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Register the user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400 && data.details) {
          setFieldErrors(data.details.fieldErrors);
          setError("Please fix the errors below");
        } else if (response.status === 409) {
          setError(data.error || "An account with this email already exists");
        } else {
          setError(data.error || "Failed to create account");
        }
        setIsLoading(false);
        return;
      }

      // Auto sign in after successful registration
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but sign in failed - redirect to login
        router.push("/login?registered=true");
        return;
      }

      // Redirect to dashboard
      router.push("/");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Start inspecting properties with AI-powered insights
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="text-foreground block text-sm font-medium"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:outline-none"
                placeholder="John Doe"
              />
              {fieldErrors?.name && (
                <p className="text-destructive mt-1 text-xs">
                  {fieldErrors.name[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-foreground block text-sm font-medium"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:outline-none"
                placeholder="you@example.com"
              />
              {fieldErrors?.email && (
                <p className="text-destructive mt-1 text-xs">
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-foreground block text-sm font-medium"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:outline-none"
                placeholder="••••••••"
              />
              {fieldErrors?.password && (
                <p className="text-destructive mt-1 text-xs">
                  {fieldErrors.password[0]}
                </p>
              )}
              <p className="text-muted-foreground mt-1 text-xs">
                Must be at least 8 characters with uppercase, lowercase, and
                number
              </p>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="text-foreground block text-sm font-medium"
              >
                Confirm password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-input bg-background text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-1 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="border-input text-primary focus:ring-primary h-4 w-4 rounded"
            />
            <label
              htmlFor="terms"
              className="text-muted-foreground ml-2 block text-sm"
            >
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-primary hover:text-primary/80"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-primary hover:text-primary/80"
              >
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary w-full rounded-md px-4 py-2 text-sm font-semibold shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary/80 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
