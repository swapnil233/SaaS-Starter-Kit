import { VerifiedSession, withAuth } from "@/lib/auth/withAuth";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  session: VerifiedSession
) {
  if (req.method !== "GET") {
    return res
      .status(HttpStatus.MethodNotAllowed)
      .json({ error: "Method not allowed" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hasUsedTrial: true },
    });

    if (!user) {
      return res.status(HttpStatus.NotFound).json({ error: "User not found" });
    }

    return res.status(HttpStatus.Ok).json({
      isEligible: !user.hasUsedTrial,
    });
  } catch (error) {
    console.error("Error checking trial eligibility:", error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ error: "Failed to check trial eligibility" });
  }
});
