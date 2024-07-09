import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import useAccountForm from "@/hooks/useAccountForm";
import { auth } from "@/lib/auth/auth";
import { NextPageWithLayout } from "@/pages/page";
import { getUser, getUserAccount } from "@/services/user.service";
import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  Grid,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  Tooltip,
} from "@mantine/core";
import { Account, User } from "@prisma/client";
import { IconCircleCheckFilled, IconInfoCircle } from "@tabler/icons-react";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await auth(context.req, context.res);

  if (!session) {
    return {
      redirect: {
        destination: `/signin`,
        permanent: false,
      },
    };
  }

  try {
    const user = await getUser({ id: session.user.id });

    if (!user) {
      return {
        redirect: {
          destination: `/signin`,
          permanent: false,
        },
      };
    }

    const account = await getUserAccount(user.id);

    return {
      props: {
        user: JSON.parse(JSON.stringify(user)),
        account: JSON.parse(JSON.stringify(account)),
      },
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }
}

interface IAccountPageProps {
  user: User;
  account: Account;
}

const AccountPage: NextPageWithLayout<IAccountPageProps> = ({
  user,
  account,
}) => {
  const { register, handleSubmit, errors, onSubmit, isLoading } =
    useAccountForm(user);

  return (
    <>
      <SharedHead title="Account" />
      <Title order={2} mb={32}>
        Account
      </Title>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid gutter="xl">
          {/* Personal information */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="xs">
              <Text fw={500} size="lg" c="#333333">
                Personal information
              </Text>
              <Text c="#7D7D7D">
                This information will be viewable by other users of this
                application.
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card radius="md" withBorder p={0}>
              <Stack>
                <Stack
                  gap={24}
                  px={{
                    base: 16,
                    md: 32,
                  }}
                  py={{
                    base: 16,
                    md: 32,
                  }}
                >
                  {account.type === "oauth" && (
                    <Alert
                      variant="light"
                      color="blue"
                      icon={<IconInfoCircle />}
                    >
                      <Text>
                        You can’t change your email because your account is
                        authenticated with{" "}
                        {account.provider.charAt(0).toUpperCase() +
                          account.provider.slice(1)}
                        .
                      </Text>
                    </Alert>
                  )}
                  <Stack gap={8}>
                    <Text fw={500}>Profile picture</Text>
                    <Group>
                      <Avatar
                        size="lg"
                        src={user.image}
                        alt="User profile picture."
                      />
                      <Button variant="default">Change</Button>
                    </Group>
                  </Stack>
                  <TextInput
                    size="md"
                    radius="xs"
                    label="Full name"
                    placeholder="John"
                    {...register("name")}
                    error={errors.name?.message}
                  />
                  <TextInput size="md" radius="xs" label="Preferred name" />
                  <TextInput
                    size="md"
                    radius="xs"
                    label="Email address"
                    placeholder="you@example.com"
                    {...register("email")}
                    error={errors.email?.message}
                    disabled={account.type === "oauth"}
                    rightSection={
                      user.emailVerified && (
                        <Tooltip
                          label={`Your email was verified on ${new Date(user.emailVerified).toDateString()} at ${new Date(user.emailVerified).toLocaleTimeString()}`}
                        >
                          <IconCircleCheckFilled color="#008000" />
                        </Tooltip>
                      )
                    }
                  />
                  <Stack>
                    <Text fw={500} size="md">
                      Contact preferences
                    </Text>
                    <Stack gap="xs">
                      <Checkbox
                        defaultChecked
                        label="Send me emails about my account."
                      />
                      <Checkbox
                        defaultChecked
                        label="Send me notifications about product updates."
                      />
                      <Checkbox
                        defaultChecked
                        label="Send me occasional newsletters and special offers."
                      />
                    </Stack>
                  </Stack>
                </Stack>
                <div className="h-[1px] w-full bg-[#D6D6D6]"></div>
                <Group
                  justify="flex-start"
                  px={{
                    base: 16,
                    md: 32,
                  }}
                  pb={16}
                >
                  <Button size="md" type="submit" loading={isLoading}>
                    Save changes
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Change password */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="xs">
              <Text fw={500} size="lg" c="#333333">
                Change your password
              </Text>
              <Text c="#7D7D7D">
                If you think your password may have been compromised, you may
                change it here.
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card radius="md" withBorder p={0}>
              <Stack>
                <Stack
                  gap={24}
                  px={{
                    base: 16,
                    md: 32,
                  }}
                  py={{
                    base: 16,
                    md: 32,
                  }}
                >
                  {account.type === "oauth" && (
                    <Alert
                      variant="light"
                      color="blue"
                      icon={<IconInfoCircle />}
                    >
                      <Text>
                        You can’t change your password because your account is
                        authenticated with{" "}
                        {account.provider.charAt(0).toUpperCase() +
                          account.provider.slice(1)}
                        .
                      </Text>
                    </Alert>
                  )}
                  <PasswordInput
                    size="md"
                    radius="xs"
                    label="Current password"
                    required
                    disabled={account.type === "oauth"}
                  />
                  <PasswordInput
                    size="md"
                    radius="xs"
                    label="New password"
                    disabled={account.type === "oauth"}
                  />
                  <PasswordInput
                    size="md"
                    radius="xs"
                    label="Confirm new password"
                    disabled={account.type === "oauth"}
                  />
                </Stack>
                <div className="h-[1px] w-full bg-[#D6D6D6]"></div>
                <Group
                  justify="flex-start"
                  px={{
                    base: 16,
                    md: 32,
                  }}
                  pb={16}
                >
                  <Button
                    size="md"
                    type="submit"
                    disabled={account.type === "oauth"}
                  >
                    Save changes
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Integrations */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="xs">
              <Text fw={500} size="lg" c="#333333">
                Integrations
              </Text>
              <Text c="#7D7D7D">
                Easily set up integrations with just a few clicks.
              </Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card radius="md" withBorder p={0}>
              <Stack
                gap={24}
                px={{
                  base: 16,
                  md: 32,
                }}
                py={{
                  base: 16,
                  md: 32,
                }}
              >
                <Group wrap="nowrap">
                  <Group wrap="nowrap" mr="auto">
                    <Image
                      src="/gc.svg"
                      width={42}
                      height={42}
                      alt="Google Calendar logo"
                    />
                    <Stack gap={4}>
                      <Title order={4}>Google Calendar</Title>
                      <Text>
                        Connect your calendar to check your availability and
                        sync events
                      </Text>
                    </Stack>
                  </Group>
                  <Group justify="flex-end">
                    <Button>Connect</Button>
                  </Group>
                </Group>

                <Group wrap="nowrap">
                  <Group wrap="nowrap" mr="auto">
                    <Image
                      src="/msft.svg"
                      width={42}
                      height={42}
                      alt="Microsoft logo"
                    />
                    <Stack gap={4} align="stretch">
                      <Title order={4}>Microsoft</Title>
                      <Text>
                        Connect your Microsoft account to check your Outlook
                        Calendar availability.
                      </Text>
                    </Stack>
                  </Group>
                  <Group justify="flex-end">
                    <Button>Connect</Button>
                  </Group>
                </Group>

                <Group wrap="nowrap">
                  <Group wrap="nowrap" mr="auto">
                    <Image
                      src="/zoom.png"
                      width={42}
                      height={42}
                      alt="Zoom logo"
                    />
                    <Stack gap={4}>
                      <Title order={4}>Zoom</Title>
                      <Text>
                        Connect to Zoom to synchronize meetings on your
                        Interview studies.
                      </Text>
                    </Stack>
                  </Group>
                  <Group justify="flex-end">
                    <Button>Connect</Button>
                  </Group>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Delete account */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="xs">
              <Text fw={500} size="lg" c="#333333">
                Delete account
              </Text>
              <Text c="#7D7D7D">Deleting your account is irreversible.</Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card radius="md" withBorder p={0}>
              <Group
                px={{
                  base: 16,
                  md: 32,
                }}
                py={{
                  base: 16,
                  md: 32,
                }}
              >
                <Button size="md" color="red">
                  Delete my account
                </Button>
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      </form>
    </>
  );
};

export default AccountPage;
AccountPage.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};
