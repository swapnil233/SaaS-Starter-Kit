import { VerifiedSession, withAuth } from "@/lib/auth/withAuth";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import { updateUser } from "@/services/user.service";
import { NextApiRequest, NextApiResponse } from "next";

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  session: VerifiedSession
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(HttpStatus.MethodNotAllowed)
      .json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { key } = req.body;
    if (!key || typeof key !== "string") {
      return res
        .status(HttpStatus.BadRequest)
        .json({ error: "Profile picture key is required" });
    }

    // Update user's image in the database
    await updateUser(session.user.id, { image: key });

    return res.status(HttpStatus.Ok).json({ success: true });
  } catch (error: any) {
    console.error("Error updating profile picture key:", error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ error: "Failed to update profile picture" });
  }
});
