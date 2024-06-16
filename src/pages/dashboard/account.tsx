import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import { auth } from "@/lib/auth/auth";
import { NextPageWithLayout } from "@/pages/page";
import { getUserById } from "@/services/user.service";
import { Stack, Text, Title } from "@mantine/core";
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
    const user = await getUserById(session.user.id);
    return {
      props: {
        user: JSON.parse(JSON.stringify(user)),
      },
    };
  } catch (error) {
    console.log("Couldn't fetch user");
    return {
      redirect: { destination: "/signin" },
    };
  }
}

interface IAccountPageProps {
  user: User;
}

const Account: NextPageWithLayout<IAccountPageProps> = ({ user }) => {
  return (
    <>
      <SharedHead title="Account" />
      <Stack gap={"lg"}>
        <Title order={2}>Account</Title>
        <Stack gap={"md"}>
          <Text>{user.name}</Text>
          <Text>{user.email}</Text>
        </Stack>
      </Stack>
    </>
  );
};

export default Account;
Account.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};
