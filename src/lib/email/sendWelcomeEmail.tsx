import { render } from "@react-email/components";
import { sendEmail } from "./sendEmail";
import WelcomeEmail from "@/components/emails/WelcomeEmail";
import app from "../app";

export const sendWelcomeEmail = async (name: string, email: string) => {
  const subject = `Welcome to ${app.name}`;
  const html = render(WelcomeEmail({ name, subject }));

  await sendEmail({
    to: email,
    subject,
    html,
  });
};
