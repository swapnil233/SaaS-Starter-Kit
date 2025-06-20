import { Role } from "@prisma/client";

export interface ICreateInvitationsPayload {
  email: string;
  role: Role;
}

export interface EmailData {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
}
