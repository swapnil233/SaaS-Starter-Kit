import app from "@/lib/app";

export const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN!;

// Sender addresses for different email types
export const FROM_ADDRESSES = {
  notifications: `${app.name} <notifications@${EMAIL_DOMAIN}>`,
  invites: `${app.name} <invites@${EMAIL_DOMAIN}>`,
  welcome: `${app.name} <welcome@${EMAIL_DOMAIN}>`,
  verify: `${app.name} <verify@${EMAIL_DOMAIN}>`,
  reset: `${app.name} <reset@${EMAIL_DOMAIN}>`,
  help: `${app.name} <help@${EMAIL_DOMAIN}>`,
} as const;

// Subject formatting helpers
export const createSubject = (subject: string): string =>
  `${app.name} - ${subject}`;

export const createSubjects = {
  welcome: () => `Welcome to ${app.name}`,
  verify: () => createSubject("Verify your email"),
  resetPassword: () => createSubject("Reset Your Password"),
  resetConfirmation: () => createSubject("Password Reset Successfully"),
  invitation: (teamName: string) => `Join ${teamName} on ${app.name}`,
  invitationAccepted: (newMemberName: string, teamName: string | null) =>
    `${newMemberName} just joined your team ${teamName || `on ${app.name}`}`,
  invitationDeclined: (declinedByName: string, teamName: string | null) =>
    `${declinedByName} declined your invitation to ${teamName || "your team"}`,
  teamCreated: (teamName: string, isPaidPlan: boolean = false) =>
    `${isPaidPlan ? "Paid team" : "Team"} "${teamName}" created successfully`,
  transcription: (fileName: string) =>
    `Transcription completed for ${fileName}`,
  subscriptionChanged: (teamName: string, isUpgrade: boolean = true) =>
    `Your ${teamName} subscription has been ${isUpgrade ? "upgraded" : "downgraded"}`,
};
