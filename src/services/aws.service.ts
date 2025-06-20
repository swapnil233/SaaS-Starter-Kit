import { getEnv } from "@/lib/getEnv";
import { host } from "@/lib/host";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const getS3Client = (): S3Client => {
  const accessKeyId = getEnv("ACCESS_KEY_ID");
  const secretAccessKey = getEnv("SECRET_ACCESS_KEY");
  const region = getEnv("BUCKET_REGION");

  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

export const checkFileExistsInS3 = async ({
  bucket,
  key,
}: {
  bucket: string;
  key: string;
}): Promise<boolean> => {
  const client = getS3Client();
  const headCommand = new HeadObjectCommand({ Bucket: bucket, Key: key });

  try {
    await client.send(headCommand);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "NotFound") {
      return false;
    }
    if (error instanceof Error) {
      throw new Error(`Error checking file existence: ${error.message}`);
    }
    throw new Error("Unexpected error occurred while checking file existence.");
  }
};

// Generate a signed URL for a file in the S3 bucket
export const generateSignedUrl = async (
  key: string
): Promise<string | null> => {
  try {
    const bucket =
      process.env.NODE_ENV === "production"
        ? process.env.BUCKET_NAME_PROD!
        : process.env.BUCKET_NAME_DEV!;
    const client = getS3Client();

    const exists = await checkFileExistsInS3({ bucket, key });
    if (!exists) return null;

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn: 8 * 60 * 60 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error generating signed URL:", error.message);
      throw new Error(`Error generating signed URL: ${error.message}`);
    }
    throw new Error("Unexpected error occurred while generating signed URL.");
  }
};

// Fetch the signed URL for a file in the S3 bucket given the key (file path)
export const fetchSignedUrl = async (key: string): Promise<string> => {
  try {
    const apiUrl =
      process.env.NODE_ENV === "development" ? "http://localhost:3003" : host;

    const response = await fetch(`${apiUrl}/api/files/signed-url?key=${key}`);

    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.statusText}`);
    }

    const { url } = await response.json();
    return url;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching signed URL:", error.message);
      throw new Error(`Error fetching signed URL: ${error.message}`);
    }
    throw new Error("Unexpected error occurred while fetching signed URL.");
  }
};

export const getPresignedUploadUrl = async ({
  bucket,
  key,
}: {
  bucket: string;
  key: string;
}): Promise<string> => {
  const client = getS3Client();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  try {
    return getSignedUrl(client, command, { expiresIn: 3600 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating presigned upload URL:", error.message);
      throw new Error(`Error creating presigned upload URL: ${error.message}`);
    }
    throw new Error(
      "Unexpected error occurred while creating presigned upload URL."
    );
  }
};

export const createPresignedDownloadUrl = async ({
  bucket,
  key,
}: {
  bucket: string;
  key: string;
}): Promise<string> => {
  const client = getS3Client();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  try {
    return getSignedUrl(client, command, { expiresIn: 8 * 60 * 60 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating presigned download URL:", error.message);
      throw new Error(
        `Error creating presigned download URL: ${error.message}`
      );
    }
    throw new Error(
      "Unexpected error occurred while creating presigned download URL."
    );
  }
};

export const deleteObjectsInPrefix = async ({
  bucket,
  prefix,
  excludeKey,
}: {
  bucket: string;
  prefix: string;
  excludeKey?: string;
}): Promise<void> => {
  const client = getS3Client();

  try {
    // List all objects with the given prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });

    const { Contents } = await client.send(listCommand);

    if (!Contents) return;

    // Delete each object except the excluded key
    for (const object of Contents) {
      if (object.Key && object.Key !== excludeKey) {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: bucket,
          Key: object.Key,
        });
        await client.send(deleteCommand);
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error deleting objects:", error.message);
      throw new Error(`Error deleting objects: ${error.message}`);
    }
    throw new Error("Unexpected error occurred while deleting objects.");
  }
};
