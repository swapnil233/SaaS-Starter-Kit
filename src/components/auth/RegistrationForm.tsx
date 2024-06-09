import {
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Provider } from "next-auth/providers/index";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { FC, useState } from "react";
import { GoogleIcon } from "../icons/GoogleIcon";
import { IconCircleCheck, IconX } from "@tabler/icons-react";
import { PasswordValidationServices } from "@/services/auth/PasswordValidationService";
import { notifications } from "@mantine/notifications";

interface IRegistrationFormProps {
  providers: Provider[];
}

const RegistrationForm: FC<IRegistrationFormProps> = ({ providers }) => {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      password: "",
      terms: false,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) =>
        val.length <= 6
          ? "Password should include at least 6 characters"
          : null,
    },
  });

  const passwordService = new PasswordValidationServices();
  const passwordValidation = passwordService.validate(password);

  const handleSubmit = async (values: typeof form.values) => {
    if (loading) return;
    setLoading(true);

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
      alert("Registration failed");
      notifications.show({
        title: "Registration failed",
        message: `We couldn't register your account. Please refresh the page and try again. If the issue persists, try different credentials.`,
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
      alert("Login failed");
      setLoading(false);
    }

    setLoading(false);
    return;
  };

  return (
    <Paper radius="md" p="xl" m={"lg"} withBorder w={"90%"} maw={400}>
      <Text size="lg" fw={500}>
        Welcome to QualSearch, register with
      </Text>

      <Group grow mb="md" mt="md">
        {Object.values(providers).map(
          (provider) =>
            provider.name !== "Credentials" && (
              <Button
                key={provider.name}
                leftSection={provider.name === "Google" ? <GoogleIcon /> : null}
                variant="default"
                disabled={provider.name !== "Google"}
                onClick={() => signIn(provider.id)}
              >
                {provider.name}
              </Button>
            )
        )}
      </Group>

      <Divider label="Or continue with email" labelPosition="center" my="lg" />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Name"
            required
            placeholder="John Doe"
            value={form.values.name}
            onChange={(event) =>
              form.setFieldValue("name", event.currentTarget.value)
            }
            radius="md"
          />

          <TextInput
            required
            label="Email"
            placeholder="john.doe@work.com"
            value={form.values.email}
            onChange={(event) =>
              form.setFieldValue("email", event.currentTarget.value)
            }
            error={form.errors.email && "Invalid email"}
            radius="md"
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={form.values.password}
            onChange={(event) => {
              form.setFieldValue("password", event.currentTarget.value);
              setPassword(event.currentTarget.value);
            }}
            error={
              form.errors.password &&
              "Password should include at least 6 characters"
            }
            radius="md"
          />

          <PasswordInput
            required
            label="Confirm password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.currentTarget.value);
            }}
            radius="md"
          />

          <Stack gap={"xs"}>
            {passwordValidation.map((req, index) => (
              <Group key={index} gap="xs">
                {req.meets ? (
                  <IconCircleCheck size={16} color="teal" />
                ) : (
                  <IconX size={16} color="red" />
                )}
                <Text size="sm">{req.label}</Text>
              </Group>
            ))}
            <Group gap="xs">
              {confirmPassword === password && confirmPassword !== "" ? (
                <IconCircleCheck size={16} color="teal" />
              ) : (
                <IconX size={16} color="red" />
              )}
              <Text size="sm">Passwords match</Text>
            </Group>
          </Stack>

          <Checkbox
            mt={"md"}
            label="I accept terms and conditions"
            checked={form.values.terms}
            onChange={(event) =>
              form.setFieldValue("terms", event.currentTarget.checked)
            }
          />
        </Stack>

        <Stack mt={"xl"}>
          <Button
            type="submit"
            loading={loading}
            disabled={
              !form.values.terms ||
              passwordValidation.some((req) => !req.meets) ||
              loading ||
              confirmPassword !== password
            }
          >
            Register
          </Button>
          <Anchor component={Link} href="/signin" mt={"md"} size="sm" fw={500}>
            Already have an account? Login
          </Anchor>
        </Stack>
      </form>
    </Paper>
  );
};

export { RegistrationForm };
