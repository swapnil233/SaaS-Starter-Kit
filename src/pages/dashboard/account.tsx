import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import useAccountForm from "@/hooks/useAccountForm";
import { auth } from "@/lib/auth/auth";
import { NextPageWithLayout } from "@/pages/page";
import { getUser } from "@/services/user.service";
import {
  Button,
  Card,
  Grid,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { User } from "@prisma/client";
import { GetServerSidePropsContext } from "next";

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
    return {
      props: {
        user: JSON.parse(JSON.stringify(user)),
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
}

const Account: NextPageWithLayout<IAccountPageProps> = ({ user }) => {
  const { register, handleSubmit, errors, onSubmit, isLoading } =
    useAccountForm(user);

  return (
    <>
      <SharedHead title="Account" />
      <Title order={2} mb={32}>
        Account
      </Title>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid gutter={{ base: "sm", md: "xl" }}>
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
                <Stack gap={24} px={32} pt={32} pb={16}>
                  {/* <Stack gap={8}>
                    <Text fw={500}>Profile picture</Text>
                    <Group>
                      <Image
                        width={64}
                        height={64}
                        src={user.image || ""}
                        alt="User profile picture"
                        className="rounded-full"
                      />
                      <Button variant="default">Change</Button>
                    </Group>
                  </Stack> */}
                  <TextInput
                    size="md"
                    radius="xs"
                    label="Full name"
                    placeholder="John"
                    {...register("name")}
                    error={errors.name?.message}
                  />
                  <TextInput
                    size="md"
                    radius="xs"
                    label="Email address"
                    placeholder="you@example.com"
                    {...register("email")}
                    error={errors.email?.message}
                    disabled={!!user.emailVerified}
                  />
                </Stack>
                <div className="h-[1px] w-full bg-[#D6D6D6]"></div>
                <Group justify="flex-end" px={32} pb={16}>
                  <Button size="md" type="submit" loading={isLoading}>
                    Save changes
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </form>
    </>
  );
};

export default Account;
Account.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};
