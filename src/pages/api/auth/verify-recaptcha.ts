import { verifyRecaptchaToken } from "@/lib/auth/verifyRecaptcha";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const bodySchema = z.object({
  token: z.string().min(1),
});

/**
 * @deprecated This endpoint is kept for backward compatibility.
 * We now verify reCAPTCHA tokens directly in the auth endpoints to prevent token reuse.
 *
 * For new implementations, the token should be sent directly to the auth endpoint
 * (login, register, reset-password, etc.) and verified there.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(HttpStatus.MethodNotAllowed).json({
      error: `Method ${req.method} not allowed`,
    });
  }

  const body = bodySchema.parse(req.body);

  const { token } = body;

  try {
    // Verify the reCAPTCHA token with Google's verification API
    const verification = await verifyRecaptchaToken(token);

    if (!verification.success) {
      console.error("reCAPTCHA verification failed:", verification);
      return res.status(HttpStatus.Unauthorized).json({
        error: "reCAPTCHA verification failed",
      });
    }

    return res.status(HttpStatus.Ok).json({ success: true });
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return res.status(HttpStatus.InternalServerError).json({
      error: "Failed to verify reCAPTCHA",
    });
  }
}
