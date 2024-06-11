import { Stack, useMantineTheme } from "@mantine/core";
import { GetServerSidePropsContext } from "next";
import { getProviders } from "next-auth/react";
import { Provider } from "next-auth/providers/index";
import { LoginForm } from "@/components/auth/LoginForm";
import { auth } from "@/lib/auth/auth";

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
  const theme = useMantineTheme();
  return (
    <>
      <Stack
        w={"100%"}
        h={"100vh"}
        justify="center"
        align="center"
        bg={theme.colors.dark[8]}
      >
        <LoginForm providers={providers} />
      </Stack>
    </>
  );
};

export default SignInPage;
