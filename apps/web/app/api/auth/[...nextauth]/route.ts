import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// TODO: Configure proper authentication with database
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // TODO: Implement actual authentication logic with database
        if (
          credentials?.email === "demo@inspectai.com" &&
          credentials?.password === "demo123"
        ) {
          return {
            id: "1",
            email: "demo@inspectai.com",
            name: "Demo User",
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
