import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import SharedHead from "@/components/shared/SharedHead";
import app from "@/lib/app";
import { Stack } from "@mantine/core";

interface ISignInPage {}

const SignInPage: React.FC<ISignInPage> = () => {
  return (
    <>
      <SharedHead title="Sign in" description={`Sign into ${app.name}`} />
      <Stack justify="center" align="center">
        <ForgotPasswordForm />
      </Stack>
    </>
  );
};

export default SignInPage;
