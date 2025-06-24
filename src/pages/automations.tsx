import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import { Container, Title } from "@mantine/core";
import { NextPage } from "next";

const AutomationsPage: NextPage = () => {
  return (
    <>
      <SharedHead title="Automations" />
      <DashboardLayout>
        <Container>
          <Title order={1}>Automations</Title>
          <p>Your automations will be displayed here.</p>
        </Container>
      </DashboardLayout>
    </>
  );
};

export default AutomationsPage;
