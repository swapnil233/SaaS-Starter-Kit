import { withAuth } from "@/lib/auth/withAuth";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import { deleteUserAccount } from "@/services/user.service";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

// Define the schema for input validation using zod
const deleteAccountSchema = z.object({
  password: z.string().optional(),
  confirmText: z.string().optional(),
});

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  session
) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);
    return res.status(HttpStatus.MethodNotAllowed).json({
      error: `Method ${req.method} Not Allowed`,
    });
  }

  try {
    // Parse and validate the request body (for future use if needed)
    deleteAccountSchema.parse(req.body);

    // Delete the user account using session user ID
    await deleteUserAccount(session.user.id);

    return res.status(HttpStatus.Ok).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);

    if (error instanceof z.ZodError) {
      return res.status(HttpStatus.BadRequest).json({ error: error.errors });
    }

    return res.status(HttpStatus.InternalServerError).json({
      error: "Failed to delete account",
    });
  }
});
