import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { auth } from "@/lib/auth/auth";
import { Stack } from "@mantine/core";
import { GetServerSidePropsContext } from "next";
import { Provider } from "next-auth/providers/index";
import { getProviders } from "next-auth/react";

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

interface IRegisterPage {
  providers: Provider[];
}

const RegisterPage: React.FC<IRegisterPage> = ({ providers }) => {
  return (
    <>
      <Stack justify="center" align="center">
        <RegistrationForm providers={providers} />
      </Stack>
    </>
  );
};

export default RegisterPage;
