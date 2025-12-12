import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Auth middleware for protecting routes
 *
 * Protected routes:
 * - / (dashboard)
 * - /inspections/*
 * - /settings
 *
 * Public routes:
 * - /login
 * - /register
 * - /api/auth/*
 */
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Define route patterns
  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicApiRoute = nextUrl.pathname === "/api/auth/register";
  const isProtectedRoute =
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/inspections") ||
    nextUrl.pathname.startsWith("/settings");

  // Allow auth API routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Redirect non-logged-in users to login for protected routes
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - API routes that don't need auth (handled in middleware)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
