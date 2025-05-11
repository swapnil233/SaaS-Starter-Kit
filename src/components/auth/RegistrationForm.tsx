import {
  RecaptchaField,
  RecaptchaRefHandle,
} from "@/components/auth/RecaptchaField";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { useRegistrationForm } from "@/hooks/useRegistrationForm";
import isPasswordValid from "@/lib/auth/isPasswordValid";
import {
  Anchor,
  Button,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Skeleton,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Provider } from "next-auth/providers/index";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRef } from "react";
import { GoogleIcon } from "../icons/GoogleIcon";
import { PasswordStrength } from "./PasswordStrength";

interface IRegistrationFormProps {
  providers: Provider[] | null;
  providersLoading: boolean;
}

const RegistrationForm: React.FC<IRegistrationFormProps> = ({
  providers,
  providersLoading,
}) => {
  const {
    register,
    handleSubmit,
    errors,
    onSubmit,
    isLoading,
    watch,
    setValue,
    setRecaptchaToken,
    isSuccess,
    isError,
  } = useRegistrationForm();

  const { isVerified, handleVerify } = useRecaptcha();
  const recaptchaRef = useRef<RecaptchaRefHandle>(null);
  const password = watch("password");

  const resetRecaptcha = () => {
    // Reset the reCAPTCHA widget, which also sets isVerified to false internally
    recaptchaRef.current?.reset();
  };

  const handleRecaptchaChange = (token: string | null) => {
    handleVerify(token);
    if (token) {
      setRecaptchaToken(token);
    }
  };

  const handleFormSubmit = async (data: any) => {
    const result = await onSubmit(data);

    // Reset reCAPTCHA if successful or if there was an error
    if (isSuccess || isError) {
      resetRecaptcha();
    }

    return result;
  };

  return (
    <Paper radius="md" p="md" m={"lg"} w={"95%"} maw={450}>
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
                    Register with {provider.name}
                  </Button>
                )
            )}
          </Stack>
        )
      )}

      <Divider
        label="Or register with email and password"
        labelPosition="center"
        my="lg"
      />

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack>
          <TextInput
            label="Name"
            required
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            {...register("name")}
            error={errors.name?.message}
            radius="xs"
            description="Your team members will see this name."
          />

          <TextInput
            required
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="john.doe@work.com"
            {...register("email")}
            error={errors.email?.message}
            radius="xs"
          />

          <PasswordInput
            required
            label="Password"
            placeholder="Your password"
            value={password || ""}
            onChange={(event) =>
              setValue("password", event.currentTarget.value)
            }
            error={errors.password?.message}
            radius="xs"
          />

          <PasswordStrength value={password || ""} />

          <RecaptchaField ref={recaptchaRef} onChange={handleRecaptchaChange} />
        </Stack>

        <Stack mt={"xl"} align="stretch">
          <Button
            type="submit"
            loading={isLoading}
            radius="xs"
            disabled={!isPasswordValid(watch("password")) || !isVerified}
          >
            {!isLoading ? "Get started" : "Registering..."}
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
