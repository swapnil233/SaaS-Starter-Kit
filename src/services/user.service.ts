import prisma from "@/lib/prisma";
import { User } from "@prisma/client";

export const getUser = async (
  key: { id: string } | { email: string }
): Promise<User | null> => {
  return await prisma.user.findUnique({
    where: key,
  });
};

export async function getAllUsers(): Promise<User[]> {
  try {
    return await prisma.user.findMany();
  } catch (error) {
    console.log("Error on getAllUsers service", error);
    throw new Error("Error retrieving all users in getAllUsers service");
  }
}

export async function updateVerificationTokenAndEmail(
  userId: string,
  emailVerifiedDate: Date,
  newEmail: string
): Promise<User> {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      emailVerified: emailVerifiedDate,
      email: newEmail,
    },
  });
}

export async function deleteVerificationToken(tokenId: string) {
  return await prisma.verificationToken.delete({
    where: {
      id: tokenId,
    },
  });
}
