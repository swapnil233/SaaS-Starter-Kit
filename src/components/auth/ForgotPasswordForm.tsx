import {
  RecaptchaField,
  RecaptchaRefHandle,
} from "@/components/auth/RecaptchaField";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import app from "@/lib/app";
import {
  Anchor,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import Image from "next/image";
import Link from "next/link";
import { FC, useRef, useState } from "react";

interface IForgotPasswordFormProps {}

const ForgotPasswordForm: FC<IForgotPasswordFormProps> = () => {
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false); // Prevents spamming
  const { isVerified, recaptchaToken, handleVerify } = useRecaptcha();
  const recaptchaRef = useRef<RecaptchaRefHandle>(null);

  const form = useForm({
    initialValues: { email: "" },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
    },
  });

  const resetRecaptcha = () => {
    // Reset the reCAPTCHA widget, which also sets isVerified to false internally
    recaptchaRef.current?.reset();
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (loading || formSubmitted || !isVerified || !recaptchaToken) return;

    setLoading(true);

    try {
      const result = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, recaptchaToken }),
      });

      const data = await result.json();

      if (result.ok) {
        notifications.show({
          title: "Success",
          message: data.message || "Password reset email sent.",
          color: "green",
        });
        setFormSubmitted(true); // Disable button after successful submission
      } else {
        notifications.show({
          title: "Error",
          message:
            data.error ||
            "An error occurred while resetting your password. Please try again later.",
          color: "red",
        });
        resetRecaptcha(); // Reset reCAPTCHA on error
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      notifications.show({
        title: "Unexpected Error",
        message:
          "Something went wrong. Please check your connection or try again later.",
        color: "red",
      });
      resetRecaptcha(); // Reset reCAPTCHA on error
    }

    setLoading(false);
  };

  return (
    <Paper radius="md" p="md" m={"lg"} w={"95%"} maw={450}>
      <Stack justify="stretch" gap="xs" mb="md" align="center">
        <Link href="/">
          <Image
            src={app.logoUrl}
            alt={app.logoUrlAlt}
            height={60}
            width={60}
          />
        </Link>

        <Stack align="center" mt={"md"} gap={4}>
          <Title order={3} style={{ textAlign: "center" }}>
            Forgot your password?
          </Title>
          <Text>Enter your email to reset your password.</Text>
        </Stack>
      </Stack>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Stack>
            <TextInput
              required
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="john.doe@work.com"
              value={form.values.email}
              onChange={(event) =>
                form.setFieldValue("email", event.currentTarget.value)
              }
              error={form.errors.email && "Invalid email"}
              radius="xs"
            />
          </Stack>

          <RecaptchaField ref={recaptchaRef} onChange={handleVerify} />

          <Stack align="stretch">
            <Button
              type="submit"
              loading={loading}
              radius="xs"
              disabled={formSubmitted || !isVerified} // Disable button if form is already submitted or reCAPTCHA not verified
            >
              {loading ? "Sending..." : "Send password reset link"}
            </Button>
            <Group gap={3} align="stretch" justify="center">
              <Text size="sm">Remember your password?</Text>
              <Anchor component={Link} href="/signin" size="sm" fw={500}>
                Sign in
              </Anchor>
            </Group>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
};

export { ForgotPasswordForm };
