import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import { Container, Title } from "@mantine/core";
import { NextPage } from "next";

const DocumentsPage: NextPage = () => {
  return (
    <>
      <SharedHead title="Documents" />
      <DashboardLayout>
        <Container>
          <Title order={1}>Documents</Title>
          <p>Your documents will be displayed here.</p>
        </Container>
      </DashboardLayout>
    </>
  );
};

export default DocumentsPage;
