import { auth } from "@/lib/auth/auth";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-auth";

export type VerifiedSession = Session & { accessToken: string };

interface Options {
  emailVerified?: boolean; // default true
}

// Wrap any Next.js API handler with auth + (optionally) email-verified checks
// Ensures user is logged in, email verified, and has accessToken
export function withAuth(
  handler: (
    _req: NextApiRequest,
    _res: NextApiResponse,
    _session: VerifiedSession
  ) => any,
  opts: Options = {}
): NextApiHandler {
  const { emailVerified = true } = opts;

  return async (req, res) => {
    const session = await auth(req, res);

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (emailVerified && !session.user.emailVerified) {
      return res.status(403).json({ error: "Account not verified." });
    }

    if (!session.accessToken) {
      // Should never happen, but keep a guard for safety
      return res.status(401).json({ error: "Missing access token" });
    }

    return handler(req, res, session as VerifiedSession);
  };
}
