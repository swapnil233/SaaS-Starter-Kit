import { useSession } from "next-auth/react";
import { NextPageWithLayout } from "./page";
import HomePageLayout from "@/components/shared/layouts/HomePageLayout";
import { Box } from "@mantine/core";
import { Navbar } from "@/components/marketing/navbar/Navbar";

const Home: NextPageWithLayout = () => {
  const { data: session } = useSession();

  return (
    <>
      <Box maw={1400} m="0 auto" py={"lg"} px={"md"}>
        <Navbar />
      </Box>
      <h1>Boilerplate</h1>
      <h1>{session?.user.name}</h1>
    </>
  );
};

export default Home;
Home.getLayout = (page) => {
  return <HomePageLayout>{page}</HomePageLayout>;
};
