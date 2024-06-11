import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import { auth } from "@/lib/auth/auth";
import { NextPageWithLayout } from "@/pages/page";
import { getUserById } from "@/services/user.service";
import { Stack, Title } from "@mantine/core";
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

interface IProfilePageProps {
  user: User;
}

const Profile: NextPageWithLayout<IProfilePageProps> = ({ user }) => {
  return (
    <Stack gap={"lg"}>
      <Title order={2}>Profile</Title>
      <Stack gap={"md"}>
        {user.name}
        {user.email}
      </Stack>
    </Stack>
  );
};

export default Profile;
Profile.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};
