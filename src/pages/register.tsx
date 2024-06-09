import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { Stack, useMantineTheme } from "@mantine/core";
import { GetServerSidePropsContext } from "next";
import { Provider } from "next-auth/providers/index";
import { getCsrfToken, getProviders, getSession } from "next-auth/react";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req } = context;
  const session = await getSession({ req });

  if (session) {
    return {
      redirect: { destination: "/" },
    };
  }

  return {
    props: {
      providers: await getProviders(),
      csrfToken: await getCsrfToken(context),
    },
  };
}

interface IRegisterPage {
  providers: Provider[];
}

const RegisterPage: React.FC<IRegisterPage> = ({ providers }) => {
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
        <RegistrationForm providers={providers} />
      </Stack>
    </>
  );
};

export default RegisterPage;
