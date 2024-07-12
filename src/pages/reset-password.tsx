import SharedHead from "@/components/shared/SharedHead";
import app from "@/lib/app";
import { Button, Paper, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/router";
import { FC, useState } from "react";

interface IResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm: FC<IResetPasswordFormProps> = ({ token }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm({
    initialValues: {
      password: "",
      confirmPassword: "",
    },

    validate: {
      password: (val) =>
        val.length >= 6
          ? null
          : "Password should be at least 6 characters long",
      confirmPassword: (val, values) =>
        val === values.password ? null : "Passwords do not match",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (loading) return;

    setLoading(true);

    const result = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password: values.password }),
    });

    if (result.ok) {
      notifications.show({
        title: "Your password has been reset",
        message: "You can now log in with your new password.",
        color: "green",
      });
      router.push("/signin");
    } else {
      notifications.show({
        title: "Error",
        message:
          "There was an error resetting your password. Please try again.",
        color: "red",
      });
    }

    setLoading(false);
  };

  return (
    <>
      <SharedHead
        title="Reset password"
        description={`Sign into ${app.name}`}
      />
      <Stack justify="center" align="center">
        <Paper radius="md" p="md" m={"lg"} w={"95%"} maw={450}>
          <Stack justify="stretch" gap="xs" mb="md" align="center">
            <Stack align="center" mt={"md"} gap={4}>
              <Title
                order={3}
                style={{
                  textAlign: "center",
                }}
              >
                Reset Your Password
              </Title>
              <Text>Enter your new password below.</Text>
            </Stack>
          </Stack>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                required
                label="New Password"
                type="password"
                autoComplete="new-password"
                placeholder="New Password"
                value={form.values.password}
                onChange={(event) =>
                  form.setFieldValue("password", event.currentTarget.value)
                }
                error={
                  form.errors.password &&
                  "Password should be at least 6 characters long"
                }
                radius="xs"
              />

              <TextInput
                required
                label="Confirm New Password"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm New Password"
                value={form.values.confirmPassword}
                onChange={(event) =>
                  form.setFieldValue(
                    "confirmPassword",
                    event.currentTarget.value
                  )
                }
                error={form.errors.confirmPassword && "Passwords do not match"}
                radius="xs"
              />
            </Stack>

            <Stack mt={"xl"} align="stretch">
              <Button type="submit" loading={loading} radius="xs">
                {!loading ? "Reset Password" : "Resetting..."}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </>
  );
};

const ResetPasswordPage: FC = () => {
  const router = useRouter();
  const { token } = router.query;

  if (!token) {
    return <Text>Error: Token is missing or invalid.</Text>;
  }

  return <ResetPasswordForm token={token as string} />;
};

export default ResetPasswordPage;
