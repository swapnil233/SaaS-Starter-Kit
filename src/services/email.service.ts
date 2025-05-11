import { Role } from "@prisma/client";
import { render } from "@react-email/render";
import { Resend } from "resend";

// Email templates
import InvitationAcceptedEmail from "@/components/emails/InvitationAcceptedEmail";
import InvitationDeclinedEmail from "@/components/emails/InvitationDeclinedEmail";
import NewTeamInvitationEmail from "@/components/emails/NewTeamInvitationEmail";
import PasswordResetConfirmationEmail from "@/components/emails/PasswordResetConfirmationEmail";
import PasswordResetEmail from "@/components/emails/PasswordResetEmail";
import { TranscriptionCompletedEmail } from "@/components/emails/TranscriptionCompletedEmail";
import VerificationEmail from "@/components/emails/VerificationEmail";
import WelcomeEmail from "@/components/emails/WelcomeEmail";

// Helpers and constants
import { FROM_ADDRESSES, createSubjects } from "@/components/emails/domains";

// Types
export interface ICreateInvitationsPayload {
  email: string;
  role: Role;
}

// Constants
const HOST = process.env.NEXT_PUBLIC_APP_URL || "https://qualsearch.io";
const DEV_HOST = "http://localhost:3000";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailData {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Resend
 */
export const sendEmail = async (data: EmailData) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("Resend API key not configured, email not sent");
    return;
  }

  const fromAddress = data.from || FROM_ADDRESSES.notifications;

  try {
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

/**
 * Get the base URL for links in emails
 */
const getBaseUrl = () => {
  return process.env.NODE_ENV === "production" ? HOST : DEV_HOST;
};

/**
 * Send a team invitation email
 */
export const sendTeamInvitationEmail = async (
  invitation: ICreateInvitationsPayload,
  invitedByName: string,
  invitedByEmail: string,
  teamName: string
): Promise<void> => {
  try {
    const inviteLink = `${getBaseUrl()}/dashboard`;

    const html = render(
      NewTeamInvitationEmail({
        invitedByName,
        invitedByEmail,
        teamName,
        inviteLink,
      })
    );

    await sendEmail({
      to: invitation.email,
      from: FROM_ADDRESSES.invites,
      subject: createSubjects.invitation(teamName),
      html,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `Error while sending invitation email to ${invitation.email}:`,
        error.message
      );
      throw new Error(
        `Failed to send invitation email to ${invitation.email}: ${error.message}`
      );
    }
    throw new Error(
      `Unexpected error while sending invitation email to ${invitation.email}`
    );
  }
};

/**
 * Send bulk team invitation emails
 */
export const sendBulkTeamInvitationEmails = async (
  invitations: ICreateInvitationsPayload[],
  invitedByName: string,
  invitedByEmail: string,
  teamName: string
): Promise<string[]> => {
  const emailPromises = invitations.map((invitation) =>
    sendTeamInvitationEmail(invitation, invitedByName, invitedByEmail, teamName)
  );

  const emailResults = await Promise.allSettled(emailPromises);
  const failedEmails = emailResults
    .filter((result) => result.status === "rejected")
    .map((_, index) => invitations[index].email);

  if (failedEmails.length > 0) {
    console.error("Failed to send emails to:", failedEmails.join(", "));
  }

  return failedEmails;
};

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
    const verificationLink = `${getBaseUrl()}/verify-email?token=${encodeURIComponent(token)}`;

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
    const resetLink = `${getBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;

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

/**
 * Send a transcription completed notification email
 */
export const sendTranscriptionCompleteNotificationEmail = async (
  linkToTranscribedFile: string,
  userName: string,
  fileName: string,
  email: string
) => {
  try {
    const subject = createSubjects.transcription(fileName);
    let html;

    try {
      // Try to use React rendering first (works in Next.js environment)
      html = render(
        TranscriptionCompletedEmail({
          linkToTranscribedFile,
          userName,
          fileName,
        })
      );
    } catch (renderError) {
      // Fallback to plain HTML template when React rendering fails (in Express environment)
      console.log("Using fallback HTML template for transcription email");
      html = `
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Transcription Completed</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  </head>
                  <body style="background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px;">
                    <div style="max-width: 465px; margin: 40px auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
                      <h1 style="font-size: 24px; text-align: center; margin: 30px 0; font-weight: normal;">
                        Transcription completed!
                      </h1>
                      <p style="font-size: 14px; line-height: 24px; color: #000000;">
                        Hello <strong>${userName}</strong>,
                      </p>
                      <p style="font-size: 14px; line-height: 24px; color: #000000;">
                        The file <strong>${fileName}</strong> has finished transcribing, and is now available for viewing.
                      </p>
                      <div style="text-align: center; margin: 32px 0;">
                        <a href="${linkToTranscribedFile}" style="background-color: #000000; color: #ffffff; font-size: 12px; font-weight: 600; text-decoration: none; text-align: center; padding: 12px 20px; border-radius: 5px;">
                          Go to file
                        </a>
                      </div>
                      <p style="font-size: 14px; line-height: 24px; color: #000000;">
                        or copy and paste this URL into your browser: 
                        <a href="${linkToTranscribedFile}" style="color: #2563eb; text-decoration: none;">
                          ${linkToTranscribedFile}
                        </a>
                      </p>
                      <hr style="border: none; border-top: 1px solid #cccccc; margin: 20px 0;">
                      <p style="font-size: 12px; line-height: 24px; color: #666666;">
                        This is a system-generated email, please do not reply directly to this email address. 
                        If you have any questions, please contact us at 
                        <a href="mailto:help@qualsearch.io" style="color: #2563eb; text-decoration: none;">
                          help@qualsearch.io
                        </a>.
                      </p>
                    </div>
                  </body>
                </html>
            `;
    }

    await sendEmail({
      to: email,
      from: FROM_ADDRESSES.notifications,
      subject,
      html,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `Error sending transcription notification email to ${email}:`,
        error.message
      );
      throw new Error(
        `Failed to send transcription notification email to ${email}: ${error.message}`
      );
    }
    throw new Error(
      "Unexpected error while sending transcription notification email."
    );
  }
};

/**
 * Send an invitation accepted email to the team creator or admin who sent the invitation
 */
export const sendInvitationAcceptedEmail = async (
  newMemberName: string,
  newMemberEmail: string,
  teamName: string | null,
  recipientName: string,
  recipientEmail: string
): Promise<void> => {
  try {
    const teamLink = `${getBaseUrl()}/dashboard`;
    const displayTeamName = teamName || "Your Team";

    const html = render(
      InvitationAcceptedEmail({
        newMemberName,
        newMemberEmail,
        teamName: displayTeamName,
        teamLink,
        recipientName,
      })
    );

    await sendEmail({
      to: recipientEmail,
      from: FROM_ADDRESSES.invites,
      subject: createSubjects.invitationAccepted(
        newMemberName,
        displayTeamName
      ),
      html,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `Error while sending invitation accepted email to ${recipientEmail}:`,
        error.message
      );
      throw new Error(
        `Failed to send invitation accepted email to ${recipientEmail}: ${error.message}`
      );
    }
    throw new Error(
      `Unexpected error while sending invitation accepted email to ${recipientEmail}`
    );
  }
};

/**
 * Send an invitation declined email to the team creator or admin who sent the invitation
 */
export const sendInvitationDeclinedEmail = async (
  declinedByName: string,
  declinedByEmail: string,
  teamName: string | null,
  recipientName: string,
  recipientEmail: string
): Promise<void> => {
  try {
    const teamLink = `${getBaseUrl()}/dashboard`;
    const displayTeamName = teamName || "Your Team";

    const html = render(
      InvitationDeclinedEmail({
        declinedByName,
        declinedByEmail,
        teamName: displayTeamName,
        teamLink,
        recipientName,
      })
    );

    await sendEmail({
      to: recipientEmail,
      from: FROM_ADDRESSES.invites,
      subject: createSubjects.invitationDeclined(
        declinedByName,
        displayTeamName
      ),
      html,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `Error while sending invitation declined email to ${recipientEmail}:`,
        error.message
      );
      throw new Error(
        `Failed to send invitation declined email to ${recipientEmail}: ${error.message}`
      );
    }
    throw new Error(
      `Unexpected error while sending invitation declined email to ${recipientEmail}`
    );
  }
};
