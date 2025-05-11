import { verifyRecaptchaToken } from "@/lib/auth/verifyRecaptcha";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import { sendPasswordResetEmail } from "@/services/email.service";
import {
  calculateTimeSincePasswordResetTokenLastSent,
  calculateWaitTimeForPasswordResetToken,
  createPasswordResetToken,
  deletePasswordResetToken,
  findExistingPasswordResetTokenByUserId,
  generatePasswordResetTokenAndExpiry,
  getUser,
  getUserAccount,
} from "@/services/user.service";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const requestPasswordResetSchema = z.object({
  email: z.string().email(),
  recaptchaToken: z.string(),
});

const successMessage = {
  message:
    "If an account with this email exists, a password reset link will be sent.",
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(HttpStatus.MethodNotAllowed)
      .json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email, recaptchaToken } = requestPasswordResetSchema.parse(
      req.body
    );

    // Verify the reCAPTCHA token
    const verification = await verifyRecaptchaToken(recaptchaToken);
    if (!verification.success) {
      return res.status(HttpStatus.Unauthorized).json({
        error: "reCAPTCHA verification failed. Please try again.",
      });
    }

    const user = await getUser({ email });

    if (!user) {
      // Generic error for non-existent user to avoid leaking information
      return res.status(HttpStatus.Ok).json({
        message:
          "If an account with this email exists, a password reset link will be sent.",
      });
    }

    const account = await getUserAccount(user.id);

    if (!account) {
      return res.status(HttpStatus.Ok).json(successMessage);
    }

    if (account.type === "oauth") {
      return res.status(HttpStatus.Ok).json(successMessage);
    }

    const existingToken = await findExistingPasswordResetTokenByUserId(user.id);

    if (existingToken) {
      const timeSinceLastSent =
        calculateTimeSincePasswordResetTokenLastSent(existingToken);

      const waitTime =
        calculateWaitTimeForPasswordResetToken(timeSinceLastSent);

      if (waitTime > 0) {
        return res.status(HttpStatus.TooManyRequests).json({
          error: `Please wait ${waitTime} minutes before requesting another password reset.`,
        });
      } else {
        await deletePasswordResetToken(existingToken.id);
      }
    }

    const { rawToken, hashedToken, prefix, expiresAt } =
      generatePasswordResetTokenAndExpiry();

    // Store only the hashed token in the database
    await createPasswordResetToken({
      userId: user.id,
      token: hashedToken,
      prefix,
      expiresAt,
    });

    // Send the raw token to the user via email
    await sendPasswordResetEmail(user.email, user.name, rawToken);

    return res.status(HttpStatus.Ok).json(successMessage);
  } catch (error) {
    console.error("Error requesting password reset:", error);

    if (error instanceof z.ZodError) {
      return res.status(HttpStatus.BadRequest).json({
        error: error.errors.map((e) => e.message).join(", "),
      });
    }

    return res
      .status(HttpStatus.InternalServerError)
      .json({ error: "Failed to request password reset" });
  }
}

// Export the handler directly without rate limiting wrapper
export default handler;
