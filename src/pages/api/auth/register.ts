import isPasswordValid from "@/lib/auth/isPasswordValid";
import { verifyRecaptchaToken } from "@/lib/auth/verifyRecaptcha";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import { sendVerificationEmail } from "@/services/email.service";
import {
  createUserWithEmailAndPassword,
  getUser,
} from "@/services/user.service";
import { createNewVerificationToken } from "@/services/verification.service";
import { hash } from "bcrypt";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const SALT_ROUNDS = 10;

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
  recaptchaToken: z.string().min(1, "reCAPTCHA verification is required"),
});

async function register(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(HttpStatus.MethodNotAllowed).end();
  }

  try {
    // Validate the request body
    const { email, password, name, recaptchaToken } = registerSchema.parse(
      req.body
    );

    // Verify reCAPTCHA token
    const verification = await verifyRecaptchaToken(recaptchaToken);
    if (!verification.success) {
      return res.status(HttpStatus.Unauthorized).json({
        message: "reCAPTCHA verification failed. Please try again.",
      });
    }

    // Validate password complexity
    if (!isPasswordValid(password)) {
      return res.status(HttpStatus.BadRequest).json({
        message:
          "Password does not meet complexity requirements. Password must be at least 6 characters long and meet all security requirements.",
      });
    }

    // Check if a user with the same email already exists
    const existingUser = await getUser({ email });
    if (existingUser) {
      // Return a generic 200 response to prevent email enumeration
      return res.status(HttpStatus.Ok).json({
        message:
          "Registration request received. If this email is not already registered, you will receive a verification email shortly.",
      });
    }

    // Hash the password
    const hashedPassword = await hash(password, SALT_ROUNDS);

    // Create a new user in the DB
    const user = await createUserWithEmailAndPassword(
      email,
      name,
      hashedPassword
    );

    // Create a new verification token in the DB
    const verificationToken = await createNewVerificationToken(user.email);

    // Send user a verification email
    await sendVerificationEmail(
      user.name || "User",
      user.email,
      verificationToken.token
    );

    return res
      .status(HttpStatus.Created)
      .json({ message: "User created", user });
  } catch (error) {
    console.error("Error registering user:", error);

    if (error instanceof z.ZodError) {
      return res
        .status(HttpStatus.BadRequest)
        .json({ message: error.errors.map((e) => e.message).join(", ") });
    }

    return res
      .status(HttpStatus.InternalServerError)
      .json({ message: "Failed to register user. Please try again later." });
  }
}

// Export the handler directly without rate limiting wrapper
export default register;
