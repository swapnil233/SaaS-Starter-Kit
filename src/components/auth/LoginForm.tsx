import {
  RecaptchaField,
  RecaptchaRefHandle,
} from "@/components/auth/RecaptchaField";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import app from "@/lib/app";
import {
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Provider } from "next-auth/providers/index";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useRef, useState } from "react";
import { GoogleIcon } from "../icons/GoogleIcon";

interface ILoginFormProps {
  providers: Provider[] | null;
  providersLoading: boolean;
  callbackUrl: string;
}

const LoginForm: FC<ILoginFormProps> = ({
  providers,
  providersLoading,
  callbackUrl,
}) => {
  const { colorScheme } = useMantineColorScheme();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isVerified, recaptchaToken, handleVerify } = useRecaptcha();
  const recaptchaRef = useRef<RecaptchaRefHandle>(null);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
    },
  });

  const resetRecaptcha = () => {
    // Reset the reCAPTCHA widget, which also sets isVerified to false internally
    recaptchaRef.current?.reset();
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (loading || !isVerified || !recaptchaToken) return;

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        recaptchaToken,
        callbackUrl,
      });

      if (result?.error) {
        notifications.show({
          title: "Login Failed",
          message:
            "The email or password you entered is incorrect. Please try again.",
          color: "red",
        });
        resetRecaptcha();
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      notifications.show({
        title: "Login Failed",
        message: "An unexpected error occurred. Please try again.",
        color: "red",
      });
      resetRecaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper radius="md" p="md" m={"lg"} w={"95%"} maw={450}>
      <Stack justify="stretch" gap="xs" mb="md" align="center">
        <Link href="/">
          <Image
            src={colorScheme === "dark" ? app.logoUrl.dark : app.logoUrl.light}
            alt={app.logoUrlAlt}
            height={60}
            width={160}
          />
        </Link>

        <Stack align="center" mt={"md"} gap={4}>
          <Title
            order={3}
            style={{
              textAlign: "center",
            }}
          >
            Welcome back to {app.name}!
          </Title>
          <Text>Please login to continue.</Text>
        </Stack>
      </Stack>
      {providersLoading ? (
        <Skeleton height={36} w={"100%"} radius="xs" />
      ) : (
        providers && (
          <Stack>
            {Object.values(providers).map(
              (provider) =>
                provider.name !== "Credentials" && (
                  <Button
                    key={provider.name}
                    leftSection={
                      provider.name === "Google" ? <GoogleIcon /> : null
                    }
                    variant="default"
                    onClick={() => signIn(provider.id)}
                    fullWidth
                    fw={400}
                    radius={"xs"}
                  >
                    Login with {provider.name}
                  </Button>
                )
            )}
          </Stack>
        )
      )}

      <Divider
        label="Or login with email and password"
        labelPosition="center"
        my="lg"
      />

      <form onSubmit={form.onSubmit(handleSubmit)}>
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

          <Stack>
            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              type="password"
              onChange={(event) => {
                form.setFieldValue("password", event.currentTarget.value);
              }}
              error={
                form.errors.password &&
                "Password should include at least 6 characters"
              }
              radius="xs"
            />
            <Group justify="space-between" align="center">
              <Checkbox size="sm" id="remember" label="Remember me" />
              <Anchor
                component={Link}
                href="/forgot-password"
                size="sm"
                fw={500}
              >
                Forgot password?
              </Anchor>
            </Group>
          </Stack>

          <RecaptchaField ref={recaptchaRef} onChange={handleVerify} />
        </Stack>

        <Stack mt={"xl"} align="stretch">
          <Button
            type="submit"
            loading={loading}
            radius="xs"
            disabled={!isVerified}
          >
            {!loading ? "Login" : "Logging in..."}
          </Button>
          <Group gap={3} align="stretch" justify="center">
            <Text size="sm">Don&apos;t have an account?</Text>
            <Anchor component={Link} href="/register" size="sm" fw={500}>
              Register
            </Anchor>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export { LoginForm };
