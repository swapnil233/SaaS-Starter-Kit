import { VerifiedSession, withAuth } from "@/lib/auth/withAuth";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import { updateUser } from "@/services/user.service";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

// Define the schema for input validation using zod
const updateProfileSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, "Full name is required"),
});

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
    // Parse and validate the request body
    const { id, name } = updateProfileSchema.parse(req.body);

    // Ensure the user can only update their own profile
    if (id !== session.user.id) {
      return res.status(HttpStatus.Forbidden).json({ error: "Forbidden" });
    }

    // Update the user in the database
    const updatedUser = await updateUser(id, { name });

    // Return the updated user data
    return res.status(HttpStatus.Ok).json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);

    // Validation errors
    if (error instanceof z.ZodError) {
      return res.status(HttpStatus.BadRequest).json({ error: error.errors });
    }

    // Generic errors
    return res
      .status(HttpStatus.InternalServerError)
      .json({ error: "Failed to update profile" });
  }
});
