import { notifications } from "@mantine/notifications";
import { signIn } from "next-auth/react";

export const registerUser = async (
  values: any,
  setLoading: (_loading: boolean) => void
) => {
  setLoading(true);

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    // Handle registration error
    if (!response.ok) {
      console.error(response);
      notifications.show({
        title: "Registration failed",
        message: await response.text(),
        color: "red",
      });
      setLoading(false);
      return;
    }

    // Login user
    const result = await signIn("credentials", {
      redirect: true,
      callbackUrl: "/",
      email: values.email,
      password: values.password,
    });

    if (result?.error) {
      notifications.show({
        title: "Login failed",
        message: `We couldn't log you in. Please try again.`,
        color: "red",
      });
      setLoading(false);
      return;
    }
  } catch (error) {
    console.error(error);
    notifications.show({
      title: "Registration failed",
      message: `An unexpected error occurred. Please try again later.`,
      color: "red",
    });
  } finally {
    setLoading(false);
  }
};
