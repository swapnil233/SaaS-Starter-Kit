import ChangePassword from "@/components/cards/account/ChangePassword";
import DeleteAccountSection from "@/components/cards/account/DeleteAccountSection";
import Integrations from "@/components/cards/account/Integrations";
import PersonalInfo from "@/components/cards/account/PersonalInfo";
import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import { auth } from "@/lib/auth/auth";
import { NextPageWithLayout } from "@/pages/page";
import {
  getUser,
  getUserAccount,
  getUserPreferences,
} from "@/services/user.service";
import { Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Account, User, UserPreferences } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { signOut } from "next-auth/react";
import { useMutation } from "react-query";

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

    if (!user) {
      return {
        redirect: {
          destination: `/signin`,
          permanent: false,
        },
      };
    }

    const account = await getUserAccount(user.id);
    const preferences = await getUserPreferences(user.id);

    return {
      props: {
        user: JSON.parse(JSON.stringify(user)),
        account: JSON.parse(JSON.stringify(account)),
        preferences: JSON.parse(JSON.stringify(preferences)),
      },
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }
}

interface IAccountPageProps {
  user: User;
  account: Account;
  preferences: UserPreferences;
}

const AccountPage: NextPageWithLayout<IAccountPageProps> = ({
  user,
  account,
  preferences,
}) => {
  const deleteAccountMutation = useMutation(
    async (userId: string) => {
      const response = await fetch("/api/users/deleteAccount", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }
    },
    {
      onSuccess: async () => {
        await signOut({ redirect: true, callbackUrl: "/" });
      },
      onError: (error) => {
        console.error("Error deleting account:", error);
        showNotification({
          title: "Error",
          message: "Failed to delete account",
          color: "red",
        });
      },
    }
  );

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate(user.id);
  };

  return (
    <>
      <SharedHead title="Account" />
      <Title order={2} mb={32}>
        Account
      </Title>

      <PersonalInfo user={user} preferences={preferences} />
      <ChangePassword account={account} />
      <Integrations />
      <DeleteAccountSection
        handleDeleteAccount={handleDeleteAccount}
        isLoading={deleteAccountMutation.isLoading}
      />
    </>
  );
};

export default AccountPage;
AccountPage.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};
