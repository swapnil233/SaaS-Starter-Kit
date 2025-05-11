import { LoginForm } from "@/components/auth/LoginForm";
import SharedHead from "@/components/shared/SharedHead";
import app from "@/lib/app";
import { Box, LoadingOverlay, Stack } from "@mantine/core";
import { Provider } from "next-auth/providers/index";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";

const SignInPage: FC = () => {
  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [providersLoading, setProvidersLoading] = useState(true);
  const { status } = useSession();
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const callbackUrl = (router.query.callbackUrl as string) || "/dashboard";

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setProvidersLoading(true);
        const response = await fetch("/api/auth/providers");
        if (!response.ok) {
          throw new Error("Failed to fetch providers");
        }
        const providersData = await response.json();
        setProviders(providersData);
        setProvidersLoading(false);
      } catch (error) {
        console.error("Error fetching providers:", error);
        setProvidersLoading(false);
      }
    };
    fetchProviders();
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      setAuthenticated(true);
      router.push(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  return (
    <>
      <SharedHead title="Sign in" description={`Sign into ${app.name}`} />
      <Box pos="relative">
        <LoadingOverlay
          visible={authenticated || providersLoading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        <Stack justify="center" align="center">
          <LoginForm
            providers={providers}
            callbackUrl={callbackUrl}
            providersLoading={providersLoading}
          />
        </Stack>
      </Box>
    </>
  );
};

export default SignInPage;
