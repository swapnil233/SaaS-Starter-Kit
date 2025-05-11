import { forwardRef, useImperativeHandle, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export interface RecaptchaRefHandle {
  reset: () => void;
}

interface RecaptchaFieldProps {
  onChange: (_token: string | null) => void;
}

export const RecaptchaField = forwardRef<
  RecaptchaRefHandle,
  RecaptchaFieldProps
>(({ onChange }, ref) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      // Reset the reCAPTCHA widget
      recaptchaRef.current?.reset();
      // Explicitly notify parent that the token is now null
      onChange(null);
    },
  }));

  const handleChange = (token: string | null) => {
    onChange(token);
  };

  return (
    <ReCAPTCHA
      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
      ref={recaptchaRef}
      onChange={handleChange}
      onExpired={() => onChange(null)}
    />
  );
});

RecaptchaField.displayName = "RecaptchaField";
