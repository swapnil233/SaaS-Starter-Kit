import {
  Anchor,
  Button,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Provider } from "next-auth/providers/index";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { FC, useState } from "react";
import { registerUser } from "@/services/auth.service";
import Image from "next/image";
import app from "@/lib/app";
import { GoogleIcon } from "../icons/GoogleIcon";
import { PasswordStrength } from "./PasswordStrength";
import isPasswordValid from "@/lib/auth/isPasswordValid";

interface IRegistrationFormProps {
  providers: Provider[];
}

const RegistrationForm: FC<IRegistrationFormProps> = ({ providers }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm({
    initialValues: {
      email: "",
      name: "",
      password: "",
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (loading) return;
    await registerUser(values, setLoading);
  };

  return (
    <Paper radius="md" p="md" m={"lg"} w={"95%"} maw={450}>
      <Stack justify="stretch" gap="xs" mb="md" align="center">
        {app.logoUrl && (
          <Link href="/">
            <Image
              src={app.logoUrl}
              alt={app.logoUrlAlt}
              height={60}
              width={60}
            />
          </Link>
        )}
        <Stack align="center" mt={"md"} gap={4}>
          <Title
            order={3}
            style={{
              textAlign: "center",
            }}
          >
            Let&apos;s get started with {app.name}!
          </Title>
          <Text>No credit card details required.</Text>
        </Stack>
      </Stack>
      <Stack>
        {Object.values(providers).map(
          (provider) =>
            provider.name !== "Credentials" && (
              <Button
                key={provider.name}
                leftSection={provider.name === "Google" ? <GoogleIcon /> : null}
                variant="default"
                onClick={() => signIn(provider.id)}
                fullWidth
                fw={400}
                radius={"xs"}
              >
                Register with {provider.name}
              </Button>
            )
        )}
      </Stack>

      <Divider
        label="Or register with email and password"
        labelPosition="center"
        my="lg"
      />

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
            radius="xs"
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
            radius="xs"
          />

          <PasswordStrength
            value={form.values.password}
            onChange={(value: string) => form.setFieldValue("password", value)}
          />
        </Stack>

        <Stack mt={"xl"} align="stretch">
          <Button
            type="submit"
            loading={loading}
            radius="xs"
            disabled={!isPasswordValid(form.values.password)}
          >
            {!loading ? "Get started" : "Registering..."}
          </Button>
          <Group gap={3} align="stretch" justify="center">
            <Text size="sm">Already have an account?</Text>
            <Anchor component={Link} href="/signin" size="sm" fw={500}>
              Sign in
            </Anchor>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export { RegistrationForm };
