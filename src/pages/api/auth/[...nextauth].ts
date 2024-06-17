import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { Adapter } from "next-auth/adapters";
import prisma from "@/lib/prisma";
import { compare } from "bcrypt";
import { sendWelcomeEmail } from "@/lib/email/sendWelcomeEmail";
import { getUser } from "@/services/user.service";

export const authOptions: NextAuthOptions = {
  secret: process.env.JWT_SECRET,
  adapter: PrismaAdapter(prisma) as Adapter,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("No credentials");
        }

        const { email, password } = credentials;
        if (!email || !password) {
          return null;
        }

        const user = await getUser({ email });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        const isValid = await compare(password, user.password || "");

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  pages: {
    signIn: "/signin",
    // newUser: "/onboarding",
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 24 hours
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && typeof token.id === "string") {
        session.user = {
          id: token.id,
          name: token.name,
          email: token.email,
          image: token.picture,
        };
      }
      return session;
    },
  },
  // https://next-auth.js.org/configuration/events
  events: {
    async createUser({ user }) {
      if (user.name && user.email) {
        await sendWelcomeEmail(user.name, user.email);
      }
    },
  },
};

export default NextAuth(authOptions);

export const config = authOptions;
