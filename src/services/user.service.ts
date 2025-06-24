import prisma from "@/lib/prisma";
import { User } from "@prisma/client";

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
