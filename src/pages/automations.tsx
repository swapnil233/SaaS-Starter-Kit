import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import { auth } from "@/lib/auth/auth";
import { Container, Title } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";

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

  return {
    props: {},
  };
}

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
