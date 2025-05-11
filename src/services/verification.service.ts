import prisma from "@/lib/prisma";
import { VerificationToken } from "@prisma/client";
import { compareSync, hashSync } from "bcrypt";
import crypto from "crypto";

const COOLDOWN_PERIOD_MS = 5 * 60 * 1000; // 5 minutes
const TOKEN_EXPIRY_MS = 3600 * 1000; // One hour

/**
 * Securely generates and hashes a verification token
 * @returns An object containing the original token (to be sent to user) and hashed token (to be stored)
 */
function generateSecureVerificationToken() {
  // Generate a secure random token
  const rawToken = crypto.randomBytes(32).toString("hex");

  // Hash the token with bcrypt for secure storage
  const hashedToken = hashSync(rawToken, 10);

  return { rawToken, hashedToken };
}

/**
 * Retrieves a verification token by its parameters
 */
export async function getVerificationToken(
  key: { id: string } | { email: string } | { token?: string }
): Promise<VerificationToken | null> {
  try {
    return await prisma.verificationToken.findFirst({
      where: key,
    });
  } catch (error) {
    throw new Error("Error retrieving token in getVerificationToken service");
  }
}

/**
 * Creates a new verification token for email verification
 */
export async function createNewVerificationToken(
  email: string
): Promise<{ token: string; verificationToken: VerificationToken }> {
  try {
    const existingToken = await getVerificationToken({ email });
    const now = new Date();

    // Handle existing token and cooldown period
    if (existingToken) {
      const timeSinceLastSent =
        now.getTime() - new Date(existingToken.lastSent).getTime();

      if (timeSinceLastSent < COOLDOWN_PERIOD_MS) {
        throw new Error(
          `Please wait ${Math.ceil(
            (COOLDOWN_PERIOD_MS - timeSinceLastSent) / 1000 / 60
          )} minutes before requesting another verification email.`
        );
      }

      await prisma.verificationToken.delete({
        where: {
          id: existingToken.id,
        },
      });
    }

    // Generate secure token (raw version to send, hashed version to store)
    const { rawToken, hashedToken } = generateSecureVerificationToken();
    const expires = new Date(now.getTime() + TOKEN_EXPIRY_MS);

    // Store only the hashed token in the database
    const verificationToken = await prisma.verificationToken.create({
      data: {
        email,
        token: hashedToken, // Store hashed token only
        expires,
        lastSent: now,
      },
    });

    // Return both the raw token (to be sent via email) and the database entry
    return {
      token: rawToken,
      verificationToken,
    };
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Unexpected error");
  }
}

/**
 * Verifies a token against its stored hash using secure comparison
 */
export async function verifyToken(
  rawToken: string,
  storedTokenData: VerificationToken
): Promise<boolean> {
  // Check if token has expired
  if (storedTokenData.expires < new Date()) {
    return false;
  }

  // Compare the raw token with the stored hash using bcrypt
  return compareSync(rawToken, storedTokenData.token);
}
