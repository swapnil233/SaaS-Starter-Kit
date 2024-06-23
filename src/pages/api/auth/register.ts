import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/services/email.service";
import { getUser } from "@/services/user.service";
import { createNewVerificationToken } from "@/services/verification.service";
import { hash } from "bcrypt";
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

  const existingUser = await getUser({ email });
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
      emailVerified: null,
      accounts: {
        create: {
          type: "credentials",
          provider: "email",
          providerAccountId: email,
        },
      },
    },
  });

  // Create a new verification token in the DB
  const verificationToken = await createNewVerificationToken(user.email);

  // Send user a verification email
  await sendVerificationEmail(
    user.name || "User",
    user.email,
    verificationToken.token
  );

  return res.status(201).json({ message: "User created", user });
}
