import {
  Anchor,
  Button,
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

interface ILoginFormProps {
  providers: Provider[];
}

const LoginForm: FC<ILoginFormProps> = ({ providers }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
      password: (val) =>
        val.length <= 6
          ? "Password should include at least 6 characters"
          : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (loading) return;

    setLoading(true);

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
  };

  return (
    <Paper radius="md" p="xl" m={"lg"} withBorder w={"90%"} maw={400}>
      <Text size="lg" fw={500}>
        Welcome to QualSearch, login with
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
            }}
            error={
              form.errors.password &&
              "Password should include at least 6 characters"
            }
            radius="md"
          />
        </Stack>

        <Stack mt={"xl"}>
          <Button type="submit" loading={loading}>
            Login
          </Button>
          <Anchor
            component={Link}
            href="/register"
            mt={"md"}
            size="sm"
            fw={500}
          >
            Don&apos;t have an account? Register
          </Anchor>
        </Stack>
      </form>
    </Paper>
  );
};

export { LoginForm };
