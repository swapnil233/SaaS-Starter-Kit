import { HttpStatus } from "@/lib/constants/HttpStatus";
import { getVerificationToken } from "@/services/verification.service";
import { NextApiRequest, NextApiResponse } from "next";

const COOLDOWN_PERIOD_MS = 5 * 60 * 1000; // 5 minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res
          .status(HttpStatus.BadRequest)
          .json({ message: "Email is required" });
      }

      const existingToken = await getVerificationToken({ email });

      if (existingToken) {
        const now = new Date();
        const timeSinceLastSent =
          now.getTime() - new Date(existingToken.lastSent).getTime();

        if (timeSinceLastSent < COOLDOWN_PERIOD_MS) {
          return res.status(HttpStatus.Ok).json({
            cooldown: COOLDOWN_PERIOD_MS - timeSinceLastSent,
          });
        }
      }

      return res.status(HttpStatus.Ok).json({ cooldown: 0 });
    } catch (error) {
      console.error("API handler error:", error);
      return res
        .status(HttpStatus.InternalServerError)
        .json({ message: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res
      .status(HttpStatus.MethodNotAllowed)
      .json({ message: `Method ${req.method} Not Allowed` });
  }
}
