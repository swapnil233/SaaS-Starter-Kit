import { updateUser } from "@/services/user.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

// Define the schema for input validation using zod
const updateUserSchema = z.object({
  id: z.string().cuid(),
  name: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Allow only PATCH requests
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Parse and validate the request body
    const { id, ...data } = updateUserSchema.parse(req.body);

    // Update the user in the database
    const updatedUser = await updateUser(id, data);

    // Return the updated user data
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);

    // Validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }

    // Prisma errors
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "User not found" });
      }
    }

    // Generic errors
    return res.status(500).json({ error: "Failed to update user" });
  }
}
