"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type UserRole = Database["public"]["Enums"]["user_role"];

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  avatarUrl: string | null;
}

/**
 * Custom hook for authentication state and actions using Supabase
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Fetch user profile from the profiles table
  const fetchProfile = useCallback(
    async (authUser: User): Promise<AuthUser | null> => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single<Profile>();

      if (profile) {
        return {
          id: profile.id,
          email: profile.email,
          name: profile.full_name,
          role: profile.role ?? "inspector",
          avatarUrl: profile.avatar_url,
        };
      }

      // Fallback to auth user data if profile doesn't exist yet
      return {
        id: authUser.id,
        email: authUser.email || "",
        name: (authUser.user_metadata?.full_name as string) || null,
        role: "inspector",
        avatarUrl: (authUser.user_metadata?.avatar_url as string) || null,
      };
    },
    [supabase]
  );

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setUser(profile);
      }

      setIsLoading(false);
    };

    getSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (session?.user) {
        const profile = await fetchProfile(session.user);
        setUser(profile);
      } else {
        setUser(null);
      }

      setIsLoading(false);

      // Refresh router on sign in/out to update server components
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, fetchProfile]);

  const isAuthenticated = !!session;

  /**
   * Sign in with email and password
   */
  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    router.refresh();
  };

  /**
   * Sign out and redirect to login
   */
  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  /**
   * Check if user has admin privileges
   */
  const isAdmin = (): boolean => {
    return user?.role === "admin";
  };

  /**
   * Check if user has manager or admin privileges
   */
  const isManagerOrAdmin = (): boolean => {
    return user?.role === "admin" || user?.role === "manager";
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
