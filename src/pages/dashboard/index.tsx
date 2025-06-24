import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import UpgradeModal from "@/components/subscriptions/UpgradeModal";
import { useSubscription } from "@/hooks/subscription/useSubscription";
import { auth } from "@/lib/auth/auth";
import {
  cleanupUpgradeModalParam,
  shouldShowUpgradeModal,
} from "@/lib/subscriptions/subscription-intent";
import { getUser } from "@/services/user.service";
import { Stack, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { User } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { useEffect } from "react";
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
  const [
    upgradeModalOpened,
    { open: openUpgradeModal, close: closeUpgradeModal },
  ] = useDisclosure(false);
  const { success } = useSubscription();

  // Check if we should show the upgrade modal based on URL params
  useEffect(() => {
    if (shouldShowUpgradeModal(new URLSearchParams(window.location.search))) {
      openUpgradeModal();
      // Clean up URL params after opening modal
      cleanupUpgradeModalParam();
    }
  }, [openUpgradeModal]);

  return (
    <>
      <SharedHead title="Dashboard" />
      <Stack>
        <Title order={2}>Hello, {user.name}</Title>
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">🎉 {success}</p>
          </div>
        )}
      </Stack>

      <UpgradeModal opened={upgradeModalOpened} onClose={closeUpgradeModal} />
    </>
  );
};

export default Dashboard;
Dashboard.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};
