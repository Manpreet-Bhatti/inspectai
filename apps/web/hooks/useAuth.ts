"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Role } from "@/types";

/**
 * Custom hook for authentication state and actions
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  /**
   * Sign in with credentials
   */
  const login = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error("Invalid credentials");
    }

    router.refresh();
    return result;
  };

  /**
   * Sign out and redirect to login
   */
  const logout = () => {
    signOut({ callbackUrl: "/login" });
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: Role): boolean => {
    return user?.role === role;
  };

  /**
   * Check if user has admin privileges
   */
  const isAdmin = (): boolean => {
    return user?.role === "ADMIN";
  };

  /**
   * Check if user has manager or admin privileges
   */
  const isManagerOrAdmin = (): boolean => {
    return user?.role === "ADMIN" || user?.role === "MANAGER";
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    login,
    logout,
    hasRole,
    isAdmin,
    isManagerOrAdmin,
  };
}
