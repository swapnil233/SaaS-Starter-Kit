import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import { Container, Title } from "@mantine/core";
import { NextPage } from "next";

const InboxPage: NextPage = () => {
  return (
    <>
      <SharedHead title="Inbox" />
      <DashboardLayout>
        <Container>
          <Title order={1}>Inbox</Title>
          <p>Your inbox will be displayed here.</p>
        </Container>
      </DashboardLayout>
    </>
  );
};

export default InboxPage;
