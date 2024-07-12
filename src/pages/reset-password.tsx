import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import SharedHead from "@/components/shared/SharedHead";
import app from "@/lib/app";
import { Stack, Text } from "@mantine/core";
import { useRouter } from "next/router";
import { FC } from "react";

const ResetPasswordPage: FC = () => {
  const router = useRouter();
  const { token } = router.query;

  if (!token) {
    return <Text>Error: Token is missing or invalid.</Text>;
  }

  return (
    <>
      <SharedHead
        title="Reset password"
        description={`Sign into ${app.name}`}
      />
      <Stack justify="center" align="center">
        <ResetPasswordForm token={token as string} />
      </Stack>
    </>
  );
};

export default ResetPasswordPage;
