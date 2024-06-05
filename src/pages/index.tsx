import { signOut, useSession } from "next-auth/react";
import { NextPageWithLayout } from "./page";
import HomePageLayout from "@/components/shared/layouts/HomePageLayout";
import Link from "next/link";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { PrismaClient } from "@prisma/client";
import { Box, Button, Stack } from "@mantine/core";
import prisma from "@/lib/prisma";

const Home: NextPageWithLayout = () => {
  const { data: session, status } = useSession();

  return (
    <>
      <h1>Boilerplate</h1>
      <h1>{session?.user.name}</h1>
      <Box maw={200}>
        <Stack>
          <Button component={Link} href="/signin">
            Sign in
          </Button>
          <Button component={Link} href="/register">
            Register
          </Button>
          {session && (
            <Button
              onClick={() => signOut({ callbackUrl: "/", redirect: true })}
            >
              Sign Out
            </Button>
          )}
        </Stack>
      </Box>
    </>
  );
};

export default Home;
Home.getLayout = (page) => {
  return <HomePageLayout>{page}</HomePageLayout>;
};
