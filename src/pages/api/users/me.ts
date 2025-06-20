import { VerifiedSession, withAuth } from "@/lib/auth/withAuth";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import { getUser } from "@/services/user.service";
import { NextApiRequest, NextApiResponse } from "next";

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  session: VerifiedSession
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const user = await getUser(
      { id: session.user.id },
      { omit: ["password", "phone"] }
    );

    if (!user) {
      return res.status(HttpStatus.NotFound).json({ error: "User not found" });
    }

    return res.status(HttpStatus.Ok).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ error: "Failed to fetch user" });
  }
});
