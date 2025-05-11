import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { PasswordResetToken, User, UserPreferences } from "@prisma/client";
import { hashSync } from "bcrypt";
import { randomBytes } from "crypto";
import { NextApiRequest, NextApiResponse } from "next";

const RESET_TOKEN_EXPIRY_MS = 3600 * 1000; // One hour

export const getCurrentUser = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getSession(req, res);

  if (!session) {
    throw new Error("Unauthorized");
  }

  return session.user;
};

export const getUser = async (
  key: { id: string } | { email: string },
  options?: { omit?: Array<keyof User> }
): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: key,
    });

    if (!user || !options?.omit?.length) {
      return user;
    }

    // Create a new object without the omitted fields
    const filteredUser = { ...user };
    for (const field of options.omit) {
      delete filteredUser[field];
    }

    return filteredUser;
  } catch (error) {
    console.error("Error fetching user", error);
    throw new Error("Error fetching user");
  }
};

export const getUserAccount = async (userId: string) => {
  try {
    return await prisma.account.findFirst({
      where: {
        userId,
      },
    });
  } catch (error) {
    console.error("Error fetching Account", error);
    throw new Error("Error fetching Account");
  }
};

export const getUserPreferences = async (
  userId: string
): Promise<UserPreferences | null> => {
  try {
    return await prisma.userPreferences.findUnique({
      where: {
        userId,
      },
    });
  } catch (error) {
    console.error("Error fetching user preferences", error);
    throw new Error("Error fetching user preferences");
  }
};

export async function createUserWithEmailAndPassword(
  email: string,
  name: string,
  hashedPassword: string
): Promise<User> {
  try {
    return await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: null,
        accounts: {
          create: {
            type: "credentials",
            provider: "email",
            providerAccountId: email,
          },
        },
        preferences: {
          create: {
            contactTimePreference: "MORNING",
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: true,
            darkMode: false, // You can customize default preferences here
            language: "en",
            newsletterSubscribed: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error creating user", error);
    throw new Error("Error creating user");
  }
}

export async function updateUser(
  userId: string,
  data: Partial<User>
): Promise<User> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (Object.keys(data).length === 0) {
    throw new Error("No data provided for update");
  }

  try {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data,
    });
  } catch (error) {
    console.error("Error updating user", error);
    throw new Error("Error updating user");
  }
}

export async function updateUserPreferences(
  userId: string,
  preferencesData: Partial<UserPreferences>
): Promise<UserPreferences> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (Object.keys(preferencesData).length === 0) {
    throw new Error("No data provided for update");
  }

  try {
    const updatedPreferences = await prisma.userPreferences.update({
      where: {
        userId: userId,
      },
      data: preferencesData,
    });
    return updatedPreferences;
  } catch (error) {
    console.error("Error updating user preferences", error);
    throw new Error("Error updating user preferences");
  }
}

export async function updateVerificationTokenAndEmail(
  userId: string,
  emailVerifiedDate: Date,
  newEmail: string
): Promise<User> {
  try {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        emailVerified: emailVerifiedDate,
        email: newEmail,
      },
    });
  } catch (error) {
    console.error("Error updating verification token and email", error);
    throw new Error("Error updating verification token and email");
  }
}

export async function deleteVerificationToken(tokenId: string) {
  try {
    return await prisma.verificationToken.delete({
      where: {
        id: tokenId,
      },
    });
  } catch (error) {
    console.error("Error deleting verification token", error);
    throw new Error("Error deleting verification token");
  }
}

export async function deleteUserAccount(userId: string): Promise<void> {
  try {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  } catch (error: any) {
    console.error(`Error deleting user account for userId ${userId}:`, error);
    throw new Error(error.message || "Error deleting user account");
  }
}

export async function createPasswordResetToken(data: {
  userId: string;
  token: string;
  prefix: string;
  expiresAt: Date;
}): Promise<PasswordResetToken> {
  try {
    return await prisma.passwordResetToken.create({ data });
  } catch (error) {
    console.error("Error creating password reset token", error);
    throw new Error("Error creating password reset token");
  }
}

export async function findExistingPasswordResetTokenByUserId(
  userId: string
): Promise<PasswordResetToken | null> {
  try {
    return await prisma.passwordResetToken.findFirst({
      where: { userId },
    });
  } catch (error) {
    throw new Error("Error retrieving password reset token");
  }
}

export function calculateTimeSincePasswordResetTokenLastSent(
  existingToken: PasswordResetToken
): number {
  const now = new Date();
  return now.getTime() - new Date(existingToken.createdAt).getTime();
}

export function calculateWaitTimeForPasswordResetToken(
  timeSinceLastSent: number
): number {
  return Math.ceil((RESET_TOKEN_EXPIRY_MS - timeSinceLastSent) / 1000 / 60);
}

/**
 * Generates a secure password reset token and its hashed version for storage
 * The raw token is sent to the user while only the hash is stored in the database
 */
export function generatePasswordResetTokenAndExpiry() {
  // Generate a cryptographically secure random token
  const rawToken = randomBytes(32).toString("hex");

  // Extract the first 8 characters as the prefix for quick lookups
  const prefix = rawToken.substring(0, 8);

  // Hash the token for secure storage using bcrypt
  const hashedToken = hashSync(rawToken, 10);

  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  // Return both the raw token (to send to user) and the hashed token (to store)
  return {
    rawToken, // Send this to the user via email
    hashedToken, // Store this in the database
    prefix, // Store this in the database for quick lookups
    expiresAt,
  };
}

export async function deletePasswordResetToken(tokenId: string) {
  try {
    return await prisma.passwordResetToken.delete({
      where: {
        id: tokenId,
      },
    });
  } catch (error) {
    console.error("Error deleting password reset token", error);
    throw new Error("Error deleting password reset token");
  }
}
