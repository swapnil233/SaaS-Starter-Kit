import { hash } from "bcrypt";
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

const SALT_ROUNDS = 10;

export default async function register(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    console.log("405");
    return res.status(405).end();
  }

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = await hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      accounts: {
        create: {
          type: "credentials",
          provider: "email",
          providerAccountId: email,
        },
      },
    },
  });

  return res.status(201).json({ message: "User created", user });
}
