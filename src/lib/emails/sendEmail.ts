import resend from "@/lib/resend";
import { EmailData } from "@/types/email.types";
import { FROM_ADDRESSES } from "./domains";

/**
 * Send an email using Resend
 */
export const sendEmail = async (data: EmailData) => {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined";

  if (isBrowser) {
    console.warn("Email services are not available in browser environment");
    return { id: "browser-environment" };
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("Resend API key not configured, email not sent");
    return { id: "no-api-key" };
  }

  const fromAddress = data.from || FROM_ADDRESSES.notifications;

  try {
    if (!resend) {
      console.warn("Resend client not initialized, email not sent");
      return { id: "no-client" };
    }

    const result = await resend.emails.send({
      from: fromAddress,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
    });

    return result;
  } catch (error) {
    // Enhanced error logging with Resend-specific fields
    console.error("Error sending email with Resend:", {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : "Unknown",
      code:
        error instanceof Error && "code" in error
          ? (error as any).code
          : undefined,
      statusCode:
        error instanceof Error && "statusCode" in error
          ? (error as any).statusCode
          : undefined,
      recipient: data.to,
      subject: data.subject,
    });
    throw error;
  }
};
