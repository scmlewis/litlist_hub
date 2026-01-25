import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Only enable test credentials in development
const isDev = process.env.NODE_ENV === "development";

const testCredentialsProvider = Credentials({
  name: "Test Account",
  credentials: {
    email: { label: "Email", type: "email", placeholder: "test@example.com" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    if (
      credentials?.email === "test@example.com" &&
      credentials?.password === "test123"
    ) {
      let user = await prisma.user.findUnique({
        where: { email: "test@example.com" },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: "test@example.com",
            name: "Test User",
          },
        });
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    }
    return null;
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    // Only include test credentials in development
    ...(isDev ? [testCredentialsProvider] : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});
