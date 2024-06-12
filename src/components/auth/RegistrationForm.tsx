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
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Provider } from "next-auth/providers/index";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { FC, useState } from "react";
import { GoogleIcon } from "../icons/GoogleIcon";
import { IconCheck, IconPointFilled } from "@tabler/icons-react";
import { PasswordValidationServices } from "@/services/auth/PasswordValidationService";
import app from "@/lib/app";
import { registerUser } from "@/services/auth.service";
import Image from "next/image";

interface IRegistrationFormProps {
  providers: Provider[];
}

const RegistrationForm: FC<IRegistrationFormProps> = ({ providers }) => {
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const form = useForm({
    initialValues: {
      email: "",
      name: "",
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

  const passwordService = new PasswordValidationServices();
  const passwordValidation = passwordService.validate(password);

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
            radius="xs"
          />

          <Stack gap={4}>
            {passwordValidation.map((req, index) => (
              <Group key={index} gap="xs">
                {req.meets ? (
                  <IconCheck size={14} color="teal" />
                ) : (
                  <IconPointFilled size={14} />
                )}
                <Text size="xs">{req.label}</Text>
              </Group>
            ))}
          </Stack>
        </Stack>

        <Stack mt={"xl"} align="stretch">
          <Button
            type="submit"
            loading={loading}
            disabled={passwordValidation.some((req) => !req.meets) || loading}
            radius="xs"
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
