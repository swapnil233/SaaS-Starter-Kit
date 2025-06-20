import getGoogleCredentials from "@/lib/auth/getGoogleCredentials";
import { verifyRecaptchaToken } from "@/lib/auth/verifyRecaptcha";
import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/services/email/auth.email.service";
import { getUser } from "@/services/user.service";
import { createNewVerificationToken } from "@/services/verification.service";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import NextAuth, { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Security check: Ensure JWT_SECRET is set in production
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production environment");
}

export const authOptions: NextAuthOptions = {
  secret: process.env.JWT_SECRET,
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 14, // 14 days
    updateAge: 60 * 50, // 50 minutes. expiresIn is 1h so we refresh before token expires
  },
  providers: [
    GoogleProvider({
      clientId: getGoogleCredentials().clientId,
      clientSecret: getGoogleCredentials().clientSecret,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
        recaptchaToken: {},
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("No credentials provided");
        }

        const { email, password, recaptchaToken } = credentials;
        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        // Verify reCAPTCHA token if provided
        // This makes it optional for auto-login after registration
        if (recaptchaToken) {
          const verification = await verifyRecaptchaToken(recaptchaToken);
          if (!verification.success) {
            throw new Error("reCAPTCHA verification failed");
          }
        }

        const user = await getUser({ email });
        if (!user) throw new Error("Invalid credentials");

        const isValid = await compare(password, user.password || "");
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * JWT Callback
     *
     * This callback is executed whenever a JSON Web Token is created or updated:
     * - During initial sign-in
     * - When a session is accessed via the client
     * - When the session is updated via useSession().update()
     *
     * The returned value is encrypted and stored in a secure HTTP-only cookie.
     *
     * Invocation points:
     * - /api/auth/signin endpoint
     * - /api/auth/session endpoint
     * - getSession(), getServerSession() functions
     * - useSession() React hook
     *
     * First-time sign-in:
     * - Parameters include: token, user, account, profile, isNewUser
     * - This is the ideal time to add custom claims to the JWT
     *
     * Subsequent calls:
     * - Only the token parameter is provided
     * - Use this opportunity to refresh or validate token data
     */
    async jwt({ token, user }) {
      // If it's the initial sign-in, set the user ID and emailVerified status
      if (user) {
        token.id = user.id;
        token.emailVerified = user.emailVerified;
        token.jti = crypto.randomUUID(); // Generate a stable JTI for this session
      } else if (token.id) {
        // For subsequent sessions, ensure emailVerified is up-to-date
        const dbUser = await prisma.user.findUnique({
          // TODO: figure out why token.id is not typed as string
          where: { id: token.id as string },
          select: { emailVerified: true },
        });
        token.emailVerified = dbUser?.emailVerified ?? null;
      }

      // Ensure a JTI is always set, even if this is the first token refresh
      if (!token.jti) token.jti = crypto.randomUUID();

      // Always generate a new accessToken with a fresh expiration
      token.accessToken = jwt.sign(
        {
          id: token.id,
          email: token.email,
          emailVerified: token.emailVerified,
          jti: token.jti || crypto.randomUUID(), // Use existing JTI or create one
          sub: token.id, // Standard subject claim (user identifier)
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: "1h",
          issuer: process.env.NEXTAUTH_URL || "https://qualsearch.io",
          audience: "qualsearch-api",
        }
      );

      return token;
    },

    /**
     * Session Callback
     *
     * This callback is executed whenever a client-side session is checked through:
     * - /api/auth/session endpoint
     * - useSession() hook in React components
     * - getSession() function in API routes
     *
     * Key behaviors:
     * 1. Sessions remain valid for the duration specified by maxAge in the configuration
     * 2. Sessions persist while the browser tab remains open (no automatic expiration)
     * 3. The jwt() callback runs before this session() callback, allowing us to:
     *    - Access any data we added to the JWT token (like accessToken)
     *    - Transfer that data to the session object for client-side use
     *
     * Note: Any custom properties added to the JWT in the jwt() callback must be
     * explicitly added to the session object here to make them available client-side.
     *
     * Technical details:
     * - Session data is securely stored in the "next-auth.session-token" cookie
     * - To force a session refresh, call the update() method from useSession()
     */
    async session({ session, token }) {
      if (token && typeof token.id === "string") {
        session.accessToken = token.accessToken as string;
        session.user = {
          id: token.id,
          name: token.name || null,
          email: token.email || null,
          image: token.picture || null,
          emailVerified: token.emailVerified
            ? new Date(token.emailVerified as string)
            : null,
        };
      }
      return session;
    },
  },
  events: {
    /**
     * Create User Event Handler
     *
     * This event is triggered whenever a new user is created in the system.
     *
     * Key behaviors:
     * 1. For email/password sign-ups, sends a verification email if the user's email is not verified
     * 2. Creates default user preferences for all new users
     *
     * Technical details:
     * - Generates a unique verification token for email verification
     * - Sends a customized email with the verification link
     * - Sets up initial user preferences in the database
     *
     * Note: Ensure all asynchronous operations are properly handled with appropriate
     * error handling to manage potential failures during user setup processes.
     */
    async createUser({ user }) {
      try {
        if (user.email && !user.emailVerified) {
          const verificationToken = await createNewVerificationToken(
            user.email
          );
          await sendVerificationEmail(
            user.name || "User",
            user.email,
            verificationToken.token
          );
        }

        // Check if preferences already exist to avoid unique constraint violations
        const existingPreferences = await prisma.userPreferences.findUnique({
          where: { userId: user.id },
        });

        if (!existingPreferences) {
          await prisma.userPreferences.create({
            data: {
              contactTimePreference: "MORNING",
              emailNotifications: true,
              pushNotifications: true,
              smsNotifications: true,
              darkMode: false,
              userId: user.id,
              language: "en",
              newsletterSubscribed: true,
            },
          });
        }
      } catch (error) {
        console.error("Error in createUser event:", error);
        // Continue execution - don't throw as this would break the auth flow
      }
    },
  },

  pages: {
    signIn: "/signin",
    error: "/signin", // Redirect any auth errors back to sign in page
  },
};

export default NextAuth(authOptions);
