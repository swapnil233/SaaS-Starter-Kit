/**
 * Verifies reCAPTCHA token with Google's verification API
 * @param token The reCAPTCHA token from the client
 * @returns Promise resolving to {success: boolean}
 */
export async function verifyRecaptchaToken(
  token: string
): Promise<{ success: boolean }> {
  if (!token) {
    return { success: false };
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    console.error("RECAPTCHA_SECRET_KEY is not configured");
    return { success: false };
  }

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data = (await response.json()) as { success: boolean };
    return { success: data.success === true };
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error);
    return { success: false };
  }
}
