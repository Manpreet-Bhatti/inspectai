import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// TODO: Import prisma client for database authentication
// import { prisma } from "@inspectai/database";
// import { compare } from "bcryptjs";

/**
 * NextAuth.js v5 configuration
 */
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // TODO: Replace with actual database authentication
        // const user = await prisma.user.findUnique({
        //   where: { email: credentials.email },
        // });

        // if (!user || !user.passwordHash) {
        //   return null;
        // }

        // const isValid = await compare(credentials.password, user.passwordHash);

        // if (!isValid) {
        //   return null;
        // }

        // return {
        //   id: user.id,
        //   email: user.email,
        //   name: user.name,
        //   role: user.role,
        // };

        // Demo authentication
        if (
          credentials.email === "demo@inspectai.com" &&
          credentials.password === "demo123"
        ) {
          return {
            id: "1",
            email: "demo@inspectai.com",
            name: "Demo Inspector",
            role: "INSPECTOR",
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string }).id =
          token.id as string;
        (session.user as { id?: string; role?: string }).role =
          token.role as string;
      }
      return session;
    },
  },
};

/**
 * Helper to check if user is authenticated on the server
 */
export async function getServerSession() {
  // TODO: Implement proper server-side session checking
  return null;
}

/**
 * Role-based access control helper
 */
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}
