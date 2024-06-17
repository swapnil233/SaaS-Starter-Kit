import { hash } from "bcrypt";
import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { sendWelcomeEmail } from "@/lib/email/sendWelcomeEmail";

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
    return res
      .status(409)
      .send(
        "A user with this email address already exists. Please try another."
      );
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

  await sendWelcomeEmail(user.name || "User", user.email);
  return res.status(201).json({ message: "User created", user });
}
