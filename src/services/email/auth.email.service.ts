import { FROM_ADDRESSES } from "@/lib/emails/domains";

import { createSubjects } from "@/lib/emails/domains";
import PasswordResetConfirmationEmail from "@/lib/emails/PasswordResetConfirmationEmail";
import PasswordResetEmail from "@/lib/emails/PasswordResetEmail";
import { sendEmail } from "@/lib/emails/sendEmail";
import VerificationEmail from "@/lib/emails/VerificationEmail";
import WelcomeEmail from "@/lib/emails/WelcomeEmail";
import { host } from "@/lib/host";
import { render } from "@react-email/render";

/**
 * Send a welcome email
 */
export const sendWelcomeEmail = async (name: string, email: string) => {
  try {
    const subject = createSubjects.welcome();
    const html = render(WelcomeEmail({ name, subject }));

    await sendEmail({
      to: email,
      from: FROM_ADDRESSES.welcome,
      subject,
      html,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error sending welcome email to ${email}:`, error.message);
      throw new Error(
        `Failed to send welcome email to ${email}: ${error.message}`
      );
    }
    throw new Error("Unexpected error while sending welcome email.");
  }
};

/**
 * Send an email verification email
 */
export const sendVerificationEmail = async (
  name: string,
  email: string,
  token: string
) => {
  try {
    const subject = createSubjects.verify();
    const verificationLink = `${host}/verify-email?token=${encodeURIComponent(token)}`;

    const html = render(VerificationEmail({ name, subject, verificationLink }));
    await sendEmail({
      to: email,
      from: FROM_ADDRESSES.verify,
      subject,
      html,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `Error sending verification email to ${email}:`,
        error.message
      );
      throw new Error(
        `Failed to send verification email to ${email}: ${error.message}`
      );
    }
    throw new Error("Unexpected error while sending verification email.");
  }
};

/**
 * Send a password reset email
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  token: string
) => {
  try {
    const subject = createSubjects.resetPassword();
    const resetLink = `${host}/reset-password?token=${encodeURIComponent(token)}`;

    const html = render(
      PasswordResetEmail({
        name,
        subject,
        resetLink,
      })
    );

    await sendEmail({
      to: email,
      from: FROM_ADDRESSES.reset,
      subject,
      html,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `Error sending password reset email to ${email}:`,
        error.message
      );
      throw new Error(
        `Failed to send password reset email to ${email}: ${error.message}`
      );
    }
    throw new Error("Unexpected error while sending password reset email.");
  }
};

/**
 * Send a password reset confirmation email
 */
export const sendPasswordResetConfirmationEmail = async (
  email: string,
  name: string
) => {
  try {
    const subject = createSubjects.resetConfirmation();
    const html = render(PasswordResetConfirmationEmail({ name, subject }));

    await sendEmail({
      to: email,
      from: FROM_ADDRESSES.reset,
      subject,
      html,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `Error sending password reset confirmation email to ${email}:`,
        error.message
      );
      throw new Error(
        `Failed to send password reset confirmation email to ${email}: ${error.message}`
      );
    }
    throw new Error(
      "Unexpected error while sending password reset confirmation email."
    );
  }
};
