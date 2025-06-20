import { VerifiedSession, withAuth } from "@/lib/auth/withAuth";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import { getUser, updateUser } from "@/services/user.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { compare, hash } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

// Define the schema for input validation using zod
const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters long"),
});

const SALT_ROUNDS = 10;

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  session: VerifiedSession
) {
  // Allow only PATCH requests
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res
      .status(HttpStatus.MethodNotAllowed)
      .json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Get the authenticated user's ID from the session
    const userId = session.user.id;

    // Parse and validate the request body
    const { currentPassword, newPassword } = updatePasswordSchema.parse(
      req.body
    );

    // Find the user
    const user = await getUser({ id: userId });
    if (!user || !user.password) {
      return res
        .status(HttpStatus.NotFound)
        .json({ error: "User not found or password not set" });
    }

    // Check if current password matches
    const isMatch = await compare(currentPassword, user.password);
    if (!isMatch) {
      return res
        .status(HttpStatus.BadRequest)
        .json({ error: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, SALT_ROUNDS);

    // Update the password in the database
    const updatedUser = await updateUser(userId, { password: hashedPassword });

    // Return the updated user data
    return res.status(HttpStatus.Ok).json(updatedUser);
  } catch (error) {
    console.error("Error updating password:", error);

    // Validation errors
    if (error instanceof z.ZodError) {
      return res.status(HttpStatus.BadRequest).json({ error: error.errors });
    }

    // Prisma errors
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res
          .status(HttpStatus.NotFound)
          .json({ error: "User not found" });
      }
    }

    // Generic errors
    return res
      .status(HttpStatus.InternalServerError)
      .json({ error: "Failed to update password" });
  }
});
