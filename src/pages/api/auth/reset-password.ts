import { HttpStatus } from "@/lib/constants/HttpStatus";
import prisma from "@/lib/prisma";
import { sendPasswordResetConfirmationEmail } from "@/services/email/auth.email.service";
import { compare, hash } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const SALT_ROUNDS = 10;

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(HttpStatus.MethodNotAllowed)
      .json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    // Extract the first 8 characters as the prefix for lookup
    const prefix = token.substring(0, 8);

    // Find non-expired token matching the prefix
    const passwordResetToken = await prisma.passwordResetToken.findFirst({
      where: {
        prefix,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: { user: true },
    });

    // If no token found with the given prefix, or it's expired
    if (!passwordResetToken) {
      return res.status(HttpStatus.NotFound).json({
        error: "This password reset link is invalid or has expired",
      });
    }

    // Verify the full token with bcrypt
    const isValidToken = await compare(token, passwordResetToken.token);

    if (!isValidToken) {
      return res.status(HttpStatus.NotFound).json({
        error: "This password reset link is invalid or has expired",
      });
    }

    const validUser = passwordResetToken.user;

    if (!validUser.password) {
      return res
        .status(HttpStatus.BadRequest)
        .json({ error: "This account does not have a password." });
    }

    // Check if the new password is different from the old password
    if (await compare(password, validUser.password)) {
      return res
        .status(HttpStatus.BadRequest)
        .json({ error: "New password cannot be the same as the old password" });
    }

    // Hash the new password
    const hashedPassword = await hash(password, SALT_ROUNDS);

    // Use transaction to ensure atomicity - delete token first, then update password
    await prisma.$transaction(async (tx) => {
      // 1. Delete the token first to prevent reuse
      await tx.passwordResetToken.delete({
        where: { id: passwordResetToken.id },
      });

      // 2. Update the user's password
      await tx.user.update({
        where: { id: validUser.id },
        data: { password: hashedPassword },
      });
    });

    // Email the user to confirm the password reset
    await sendPasswordResetConfirmationEmail(validUser.email, validUser.name);

    return res.status(HttpStatus.Ok).json({
      message:
        "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);

    if (error instanceof z.ZodError) {
      return res
        .status(HttpStatus.BadRequest)
        .json({ error: error.errors.map((e) => e.message).join(", ") });
    }

    return res
      .status(HttpStatus.InternalServerError)
      .json({ error: "Failed to reset password. Please try again later." });
  }
}
