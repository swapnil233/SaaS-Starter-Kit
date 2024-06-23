import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/services/email.service";
import { getUser } from "@/services/user.service";
import {
  createNewVerificationToken,
  getVerificationToken,
} from "@/services/verification.service";
import { NextApiRequest, NextApiResponse } from "next";

const COOLDOWN_PERIOD_MS = 5 * 60 * 1000; // 5 minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

      const existingToken = await getVerificationToken({ email });
      const now = new Date();

      if (existingToken) {
        const timeSinceLastSent =
          now.getTime() - new Date(existingToken.lastSent).getTime();

        if (timeSinceLastSent < COOLDOWN_PERIOD_MS) {
          return res.status(429).json({
            message: `Please wait ${Math.ceil(
              (COOLDOWN_PERIOD_MS - timeSinceLastSent) / 1000 / 60
            )} minutes before requesting another verification email.`,
          });
        }

        await prisma.verificationToken.delete({
          where: {
            id: existingToken.id,
          },
        });
      }

      const { token } = await createNewVerificationToken(user.email);
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
