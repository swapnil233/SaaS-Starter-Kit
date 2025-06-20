import SharedHead from "@/components/shared/SharedHead";
import app from "@/lib/app";
import { auth } from "@/lib/auth/auth";
import { host } from "@/lib/host";
import prisma from "@/lib/prisma";
import { sendWelcomeEmail } from "@/services/email/auth.email.service";
import {
  deleteVerificationToken,
  getUser,
  updateVerificationTokenAndEmail,
} from "@/services/user.service";
import {
  getVerificationToken,
  verifyToken,
} from "@/services/verification.service";
import {
  Box,
  Button,
  Center,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconAlertCircle, IconCheck, IconMailFast } from "@tabler/icons-react";
import { GetServerSidePropsContext } from "next";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { FC, useEffect, useState } from "react";

/*
  1. Authenticates the user session using the request and response objects.
  2. Checks if the user is authenticated and has an email. If not, it redirects
     the user to the sign-in page with a callback URL.
  3. Redirects the user to the teams page if their email is already verified.
  4. Checks for a verification token in the query parameters. If absent, it fetches
     a pending verification token for the user's email and returns a message prompting
     the user to check their email or send a new verification email.
  5. Validates the provided token by comparing it against active tokens in the database.
     If the token is invalid or expired, it throws an error.
  6. Retrieves the user associated with the token's email. If the user does not exist,
     it throws an error.
  7. Updates the user's email verification status and sends a welcome email.
  8. Deletes the used verification token from the database.
  9. Returns props indicating the success of the email verification process and a
     corresponding message.
*/

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await auth(context.req, context.res);
  const token = context.query.token as string;

  if (!session || !session.user.email) {
    const redirectUrl = new URL(`${host}/signin`);
    redirectUrl.searchParams.set(
      "callbackUrl",
      encodeURI(context.req.url as string)
    );

    return {
      redirect: {
        destination: redirectUrl.toString(),
        permanent: false,
      },
    };
  }

  if (session.user.emailVerified) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  if (!token) {
    const pendingToken = await getVerificationToken({
      email: session.user.email,
    });
    return {
      props: {
        message: pendingToken
          ? "Check your email for the verification link. If you didn't receive it, you can resend the verification email."
          : `You must verify your email to access ${app.name}. Please send a verification email.`,
      },
    };
  }

  try {
    // Fetch active tokens that haven't expired
    const activeTokens = await prisma.verificationToken.findMany({
      where: {
        expires: {
          gt: new Date(), // Only consider tokens that are still valid
        },
      },
    });

    let validToken = null;
    // Check each token to find a valid one
    for (const storedToken of activeTokens) {
      if (await verifyToken(token, storedToken)) {
        validToken = storedToken; // Found a valid token
        break;
      }
    }

    if (!validToken) {
      // No valid token found
      throw new Error(
        "The verification link is invalid or has expired. Please request a new verification email."
      );
    }

    // Retrieve user associated with the valid token
    const tokenUser = await getUser({ email: validToken.email });
    if (!tokenUser) {
      throw new Error("User doesn't exist"); // User not found
    }

    // Update user's email verification status
    await updateVerificationTokenAndEmail(
      tokenUser.id,
      new Date(), // Set current date as verification date
      validToken.email
    );

    // Send a welcome email to the user
    await sendWelcomeEmail(tokenUser.name || "User", tokenUser.email);

    // Remove the used verification token
    await deleteVerificationToken(validToken.id);

    return {
      props: {
        success: true,
        message:
          "Your email has been verified! Please proceed to the dashboard.",
      },
    };
  } catch (error) {
    // Handle errors and return failure message
    return {
      props: {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong on our end. Please try again later...",
      },
    };
  }
}

interface IVerifyEmailPage {
  success?: boolean;
  message?: string;
}

const VerifyEmailPage: FC<IVerifyEmailPage> = ({ success, message }) => {
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState<number | null>(null);
  const [initialCooldownCheckDone, setInitialCooldownCheckDone] =
    useState(false);

  useEffect(() => {
    const fetchCooldown = async () => {
      if (session.data?.user.email) {
        try {
          const response = await fetch(
            `/api/public/cooldown?email=${session.data.user.email}`
          );
          const data = await response.json();
          if (response.ok) {
            setCooldown(data.cooldown > 0 ? data.cooldown : null);
          } else {
            showNotification({
              title: "Error",
              message: data.message,
              color: "red",
              icon: <IconAlertCircle />,
            });
          }
        } catch (error) {
          console.error(error);
          showNotification({
            title: "Error",
            message: "Failed to fetch cooldown status.",
            color: "red",
            icon: <IconAlertCircle />,
          });
        } finally {
          setInitialCooldownCheckDone(true);
        }
      } else {
        setInitialCooldownCheckDone(true); // No email, so no cooldown to check
      }
    };

    fetchCooldown();
  }, [session.data?.user.email]);

  useEffect(() => {
    if (cooldown !== null && cooldown > 0) {
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev && prev > 1000) {
            return prev - 1000;
          }
          clearInterval(interval);
          return null;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldown]);

  const resendVerificationEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users/verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: session.data?.user.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        showNotification({
          title: "Error",
          message: data.message,
          color: "red",
          icon: <IconAlertCircle />,
        });
      } else {
        showNotification({
          title: "Email Sent",
          message: "Please check your email for a verification link.",
          color: "green",
          icon: <IconMailFast />,
        });
        setCooldown(5 * 60 * 1000); // 5 minutes cooldown
      }
    } catch (error) {
      console.error(error);
      showNotification({
        title: "Error",
        message: "Failed to send verification email.",
        color: "red",
        icon: <IconAlertCircle />,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = () => {
    if (success) {
      return (
        <ThemeIcon color="green" size={60} radius="xl" mb="lg">
          <IconCheck size={30} />
        </ThemeIcon>
      );
    }
    return (
      <ThemeIcon color="blue" size={60} radius="xl" mb="lg">
        <IconMailFast size={30} />
      </ThemeIcon>
    );
  };

  return (
    <>
      <SharedHead
        title="Verify Email"
        description="Verify your email address to continue."
      />
      <Box
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor:
            "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))",
        }}
      >
        <Box
          component="header"
          py="md"
          style={{
            borderBottom: `1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-7))`,
          }}
        >
          <Container size="lg">
            <Group justify="space-between" align="center">
              <Link href="/" style={{ textDecoration: "none" }}>
                <Title order={3} c="dimmed">
                  {app.name}
                </Title>
              </Link>
              {session.data?.user && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() =>
                    signOut({
                      redirect: true,
                      callbackUrl: "/",
                    })
                  }
                >
                  Sign Out
                </Button>
              )}
            </Group>
          </Container>
        </Box>

        <Container
          style={{ flexGrow: 1, display: "flex" }}
          size="xs"
          px="xs"
          py="xl"
        >
          <Center style={{ width: "100%", height: "100%" }}>
            <Paper p="xl" shadow="xl" radius="md" withBorder w="100%">
              <Stack align="center">
                {renderIcon()}
                <Title order={2} ta="center">
                  {success ? "Email Verified!" : "Verify Your Email"}
                </Title>
                <Text size="md" ta="center" c="dimmed" mb="xl">
                  {message ||
                    (success
                      ? "You can now access all features."
                      : "Please check your inbox for a verification link. If you don't see it, you can resend the email below.")}
                </Text>
                {success ? (
                  <Button
                    size="md"
                    fullWidth
                    component={Link}
                    href="/dashboard"
                    leftSection={<IconCheck size={18} />}
                  >
                    Proceed to Dashboard
                  </Button>
                ) : (
                  <Button
                    size="md"
                    fullWidth
                    onClick={resendVerificationEmail}
                    loading={loading || !initialCooldownCheckDone}
                    disabled={cooldown !== null || !initialCooldownCheckDone}
                    leftSection={<IconMailFast size={18} />}
                  >
                    {cooldown !== null
                      ? `Resend in ${
                          cooldown > 60000
                            ? `${Math.ceil(cooldown / 1000 / 60)} min`
                            : `${Math.ceil(cooldown / 1000)} sec`
                        }`
                      : "Send Verification Email"}
                  </Button>
                )}
              </Stack>
            </Paper>
          </Center>
        </Container>
        <Group p="md" justify="center">
          <Text size="sm" c="dimmed">
            © {new Date().getFullYear()} {app.name}. All rights reserved.
          </Text>
        </Group>
      </Box>
    </>
  );
};

export default VerifyEmailPage;
