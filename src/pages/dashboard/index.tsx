import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import { useUser } from "@clerk/nextjs";
import { Stack, Text, Title } from "@mantine/core";
import { NextPageWithLayout } from "../page";

const Dashboard: NextPageWithLayout = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <>
        <SharedHead title="Dashboard" />
        <Stack>
          <Title order={2}>Loading...</Title>
        </Stack>
      </>
    );
  }

  return (
    <>
      <SharedHead title="Dashboard" />
      <Stack>
        <Title order={2}>
          Hello, {user?.firstName || user?.fullName || "User"}!
        </Title>
        <Text size="lg" c="dimmed">
          Welcome to your dashboard. You&apos;re successfully authenticated with
          Clerk.
        </Text>
      </Stack>
    </>
  );
};

export default Dashboard;
Dashboard.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};
