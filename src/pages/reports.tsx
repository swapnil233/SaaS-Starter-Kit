import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import { Container, Title } from "@mantine/core";
import { NextPage } from "next";

const ReportsPage: NextPage = () => {
  return (
    <>
      <SharedHead title="Reports" />
      <DashboardLayout>
        <Container>
          <Title order={1}>Reports</Title>
          <p>Your reports and analytics will be displayed here.</p>
        </Container>
      </DashboardLayout>
    </>
  );
};

export default ReportsPage;
