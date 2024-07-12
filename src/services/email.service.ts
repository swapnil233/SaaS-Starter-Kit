import PasswordResetEmail from "@/components/emails/PasswordResetEmail";
import VerificationEmail from "@/components/emails/VerificationEmail";
import WelcomeEmail from "@/components/emails/WelcomeEmail";
import app from "@/lib/app";
import { sendEmail } from "@/lib/email/sendEmail";
import { host } from "@/lib/host";
import { render } from "@react-email/components";

export const sendWelcomeEmail = async (name: string, email: string) => {
  const subject = `Welcome to ${app.name}`;
  const html = render(WelcomeEmail({ name, subject }));

  await sendEmail({
    to: email,
    subject,
    html,
  });
};

export const sendVerificationEmail = async (
  name: string,
  email: string,
  token: string
) => {
  const subject = `${app.name} - Verify your email`;
  const verificationLink = `${host}/verify-email?token=${token}`;

  const html = render(VerificationEmail({ name, subject, verificationLink }));
  await sendEmail({
    to: email,
    subject,
    html,
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  token: string
) => {
  const subject = `${app.name} - Reset Your Password`;
  const resetLink = `${host}/reset-password?token=${token}`;

  const html = render(
    PasswordResetEmail({
      name,
      subject,
      resetLink,
    })
  );

  await sendEmail({
    to: email,
    subject,
    html,
  });
};
