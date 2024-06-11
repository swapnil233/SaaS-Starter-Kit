import prisma from "@/lib/prisma";
import { User } from "@prisma/client";

export async function getUserById(id: string): Promise<User> {
  try {
    return await prisma.user.findUniqueOrThrow({
      where: {
        id,
      },
    });
  } catch (error) {
    console.log("Error on getUserById service", error)
    throw new Error("Error retrieving user by ID in getUserById service");
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    return await prisma.user.findMany();
  } catch (error) {
    console.log("Error on getAllUsers service", error)
    throw new Error("Error retrieving all users in getAllUsers service");
  }
}
