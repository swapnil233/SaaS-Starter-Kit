import { useState } from "react";

interface UseRecaptchaResult {
  isVerified: boolean;
  isVerifying: boolean;
  error: Error | null;
  recaptchaToken: string | null;
  handleVerify: (_token: string | null) => void;
}

export function useRecaptcha(): UseRecaptchaResult {
  const [isVerified, setIsVerified] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const handleVerify = (token: string | null) => {
    if (token) {
      setIsVerified(true); // optimistically enable the button
      setRecaptchaToken(token);
    } else {
      setIsVerified(false);
      setRecaptchaToken(null);
    }
  };

  return {
    isVerified,
    isVerifying: false,
    error,
    recaptchaToken,
    handleVerify,
  };
}
