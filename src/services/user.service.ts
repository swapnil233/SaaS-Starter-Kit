import prisma from "@/lib/prisma";
import { User } from "@prisma/client";

export const getUser = async (
  key: { id: string } | { email: string }
): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({
      where: key,
    });
  } catch (error) {
    console.error("Error fetching user", error);
    throw new Error("Error fetching user");
  }
};

export async function getAllUsers(): Promise<User[]> {
  try {
    return await prisma.user.findMany();
  } catch (error) {
    console.error("Error retrieving all users", error);
    throw new Error("Error retrieving all users");
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
