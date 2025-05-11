import app from "@/lib/app";

export const APP_NAME = app.name;
export const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || "qualsearch.io";

// Sender addresses for different email types
export const FROM_ADDRESSES = {
  notifications: `${APP_NAME} <notifications@${EMAIL_DOMAIN}>`,
  invites: `${APP_NAME} <invites@${EMAIL_DOMAIN}>`,
  welcome: `${APP_NAME} <welcome@${EMAIL_DOMAIN}>`,
  verify: `${APP_NAME} <verify@${EMAIL_DOMAIN}>`,
  reset: `${APP_NAME} <reset@${EMAIL_DOMAIN}>`,
  help: `${APP_NAME} <help@${EMAIL_DOMAIN}>`,
} as const;

// Subject formatting helpers
export const createSubject = (subject: string): string =>
  `${APP_NAME} - ${subject}`;

export const createSubjects = {
  welcome: () => `Welcome to ${APP_NAME}`,
  verify: () => createSubject("Verify your email"),
  resetPassword: () => createSubject("Reset Your Password"),
  resetConfirmation: () => createSubject("Password Reset Successfully"),
  invitation: (teamName: string) => `Join ${teamName} on ${APP_NAME}`,
  invitationAccepted: (newMemberName: string, teamName: string | null) =>
    `${newMemberName} just joined your team ${teamName || "on QualSearch"}`,
  invitationDeclined: (declinedByName: string, teamName: string | null) =>
    `${declinedByName} declined your invitation to ${teamName || "your team"}`,
  transcription: (fileName: string) =>
    `Transcription completed for ${fileName}`,
};
