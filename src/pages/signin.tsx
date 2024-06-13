import { Stack } from "@mantine/core";
import { GetServerSidePropsContext } from "next";
import { getProviders } from "next-auth/react";
import { Provider } from "next-auth/providers/index";
import { LoginForm } from "@/components/auth/LoginForm";
import { auth } from "@/lib/auth/auth";
import SharedHead from "@/components/shared/SharedHead";
import app from "@/lib/app";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await auth(context.req, context.res);

  if (session) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  try {
    const providers = await getProviders();

    return {
      props: {
        providers,
      },
    };
  } catch (error) {
    return {
      redirect: { destination: "/" },
    };
  }
}

interface ISignInPage {
  providers: Provider[];
}

const SignInPage: React.FC<ISignInPage> = ({ providers }) => {
  return (
    <>
      <SharedHead title="Sign in" description={`Sign into ${app.name}`} />
      <Stack justify="center" align="center">
        <LoginForm providers={providers} />
      </Stack>
    </>
  );
};

export default SignInPage;
