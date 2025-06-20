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
import { Account, User, UserPreferences } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { GetServerSidePropsContext } from "next";
import { signOut } from "next-auth/react";

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
  account: Account | null;
  preferences: UserPreferences | null;
}

const AccountPage: NextPageWithLayout<IAccountPageProps> = ({
  user,
  account,
  preferences,
}) => {
  const deleteAccountMutation = useMutation<
    void,
    Error,
    { userId: string; password?: string; confirmText?: string }
  >({
    mutationFn: async ({ userId, password, confirmText }) => {
      const response = await fetch(`/api/users/${userId}/accounts`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, confirmText }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete account");
      }
    },
    onSuccess: async () => {
      await signOut({ redirect: true, callbackUrl: "/" });
    },
  });

  const handleDeleteAccount = (data: {
    password?: string;
    confirmText?: string;
  }) => {
    return deleteAccountMutation.mutateAsync({
      userId: user.id,
      ...data,
    });
  };

  return (
    <>
      <SharedHead title="Account" description="View your account details" />

      {/* <PageHeading
        title="Account"
        description="View and manage your account details."
        breadcrumbs={[{ title: "Home", href: "/" }]}
      /> */}

      <Title order={1} mb="md">
        Account
      </Title>

      <PersonalInfo user={user} preferences={preferences} />
      <ChangePassword account={account} />
      <Integrations />
      <DeleteAccountSection
        handleDeleteAccount={handleDeleteAccount}
        isLoading={deleteAccountMutation.isPending}
        account={account}
      />
    </>
  );
};

export default AccountPage;
AccountPage.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};
