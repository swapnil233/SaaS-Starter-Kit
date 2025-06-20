import { Resend } from "resend";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

let resend: Resend | null = null;

// Only initialize Resend on the server side
if (!isBrowser) {
  // Initialize Resend
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    throw new Error("Resend API key not configured");
  }

  resend = new Resend(RESEND_API_KEY);
}

export default resend as Resend;
