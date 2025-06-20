import { VerifiedSession, withAuth } from "@/lib/auth/withAuth";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import { getPresignedUploadUrl } from "@/services/aws.service";
import { NextApiRequest, NextApiResponse } from "next";

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  session: VerifiedSession
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(HttpStatus.MethodNotAllowed)
      .json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { fileName } = req.query;
    if (!fileName || typeof fileName !== "string") {
      return res
        .status(HttpStatus.BadRequest)
        .json({ error: "File name is required" });
    }

    // Generate a unique key for the profile picture
    const timestamp = Date.now();
    const extension = fileName.split(".").pop() || "jpg";
    const key = `profile-pictures/${session.user.id}/profile-${timestamp}.${extension}`;

    const bucket =
      process.env.NODE_ENV === "production"
        ? process.env.BUCKET_NAME_PROD!
        : process.env.BUCKET_NAME_DEV!;

    // Get presigned URL for upload
    const uploadUrl = await getPresignedUploadUrl({ bucket, key });

    return res.status(HttpStatus.Ok).json({ uploadUrl, key });
  } catch (error: any) {
    console.error("Error generating upload URL:", error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ error: "Failed to generate upload URL" });
  }
});
