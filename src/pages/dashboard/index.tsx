import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import { Protect, useUser } from "@clerk/nextjs";
import { Badge, Group, Stack, Text, Title } from "@mantine/core";
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
        <Group>
          <Title order={2}>
            Hello, {user?.firstName || user?.fullName || "User"}!
          </Title>
          <Protect plan="pro">
            <Badge
              variant="gradient"
              gradient={{ from: "pink", to: "yellow" }}
              size="lg"
            >
              Pro Plan
            </Badge>
          </Protect>
        </Group>
        <Text size="lg" c="dimmed">
          Welcome to your dashboard.
        </Text>
      </Stack>
    </>
  );
};

export default Dashboard;
Dashboard.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};
