import { withAuth } from "@/lib/auth/withAuth";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import { generateSignedUrl } from "@/services/aws.service";
import { NextApiRequest, NextApiResponse } from "next";

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(HttpStatus.MethodNotAllowed)
      .json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { key } = req.query;
    if (!key || typeof key !== "string") {
      return res
        .status(HttpStatus.BadRequest)
        .json({ error: "Image key is required" });
    }

    const signedUrl = await generateSignedUrl(key);
    if (!signedUrl) {
      return res.status(HttpStatus.NotFound).json({ url: null });
    }
    return res.status(HttpStatus.Ok).json({ url: signedUrl });
  } catch (error: any) {
    console.error("Error generating signed URL:", error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ error: error.message || "Failed to generate signed URL" });
  }
});
