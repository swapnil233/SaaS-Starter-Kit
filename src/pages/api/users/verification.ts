import { HttpStatus } from "@/lib/constants/HttpStatus";
import { sendVerificationEmail } from "@/services/email/auth.email.service";
import { getUser } from "@/services/user.service";
import {
  createNewVerificationToken,
  getVerificationToken,
} from "@/services/verification.service";
import { NextApiRequest, NextApiResponse } from "next";

const COOLDOWN_PERIOD_MS = 5 * 60 * 1000; // 5 minutes

// Don't check for auth here, we want to allow unauthenticated users to verify their email
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const email = req.body.email as string;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await getUser({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.emailVerified) {
        return res
          .status(400)
          .json({ message: "Your email is already verified." });
      }

      // Check cooldown period
      const existingToken = await getVerificationToken({ email });
      if (existingToken) {
        const now = new Date();
        const timeSinceLastSent =
          now.getTime() - new Date(existingToken.lastSent).getTime();

        if (timeSinceLastSent < COOLDOWN_PERIOD_MS) {
          const remainingTime = Math.ceil(
            (COOLDOWN_PERIOD_MS - timeSinceLastSent) / 1000
          );
          return res.status(HttpStatus.TooManyRequests).json({
            message: `Please wait ${remainingTime} seconds before requesting another verification email.`,
            cooldown: COOLDOWN_PERIOD_MS - timeSinceLastSent,
          });
        }
      }

      // The updated createNewVerificationToken function returns both the raw token and verification record
      // We only need the raw token to send via email
      const { token } = await createNewVerificationToken(user.email);

      // We send the raw token in the email but store only the hashed version in the database
      await sendVerificationEmail(user.name || "User", user.email, token);

      return res.status(200).json({
        message: "Verification email sent. Please check your inbox.",
      });
    } catch (error) {
      console.error("API handler error:", error);
      if (error instanceof Error) {
        return res.status(500).json({
          message: error.message,
        });
      }
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

// Export the handler directly
export default handler;
