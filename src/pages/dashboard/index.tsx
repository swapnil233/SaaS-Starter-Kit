import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import { auth } from "@/lib/auth/auth";
import { getUser } from "@/services/user.service";
import { Stack, Title } from "@mantine/core";
import { User } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { NextPageWithLayout } from "../page";

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
    console.log(error);
    return {
      redirect: {
        destination: `/signin`,
        permanent: false,
      },
    };
  }
}

interface IDashboardPageProps {
  user: User;
}

const Dashboard: NextPageWithLayout<IDashboardPageProps> = ({ user }) => {
  return (
    <>
      <SharedHead title="Dashboard" />
      <Stack>
        <Title order={2}>Hello, {user.name}</Title>
      </Stack>
    </>
  );
};

export default Dashboard;
Dashboard.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};
