import { GetServerSidePropsContext } from "next";
import { User } from "@prisma/client";
import { auth } from "@/lib/auth/auth";
import { NextPageWithLayout } from "./page";
import { signOut } from "next-auth/react";
import { getUserById } from "@/services/user.service";
import DashboardLayout from "@/components/shared/layouts/DashboardLayout";

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

  const user = await getUserById(session.user.id);

  return {
    props: {
      user: JSON.parse(JSON.stringify(user)),
    },
  };
}

interface IDashboardPageProps {
  user: User;
}

const Dashboard: NextPageWithLayout<IDashboardPageProps> = ({ user }) => {
  return (
    <>
      <h1>{user.name}</h1>
      <button
        onClick={() =>
          signOut({
            redirect: true,
            callbackUrl: "/",
          })
        }
      >
        Sign out
      </button>
    </>
  );
};

export default Dashboard;
Dashboard.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};
