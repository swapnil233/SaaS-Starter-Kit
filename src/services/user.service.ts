import prisma from "@/lib/prisma";
import { User } from "@prisma/client";

export const getUser = async (
  key: { id: string } | { email: string }
): Promise<User> => {
  try {
    return await prisma.user.findUniqueOrThrow({
      where: key,
    });
  } catch (error) {
    console.log("Error on getUser service", error);
    throw new Error("Error retrieving user in getUser service");
  }
};

export async function getAllUsers(): Promise<User[]> {
  try {
    return await prisma.user.findMany();
  } catch (error) {
    console.log("Error on getAllUsers service", error);
    throw new Error("Error retrieving all users in getAllUsers service");
  }
}
