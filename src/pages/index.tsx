import { NextPageWithLayout } from "./page";
import HomePageLayout from "@/components/shared/layouts/HomePageLayout";
import { Box } from "@mantine/core";
import { Navbar } from "@/components/marketing/navbar/Navbar";
import { Hero } from "@/components/marketing/hero/Hero";
import { FeaturesGrid } from "@/components/marketing/features/FeaturesGrid";

const Home: NextPageWithLayout = () => {
  return (
    <>
      <Box maw={1400} m="0 auto" pt={"lg"} px={"md"}>
        <Navbar />
      </Box>
      <Hero />
      <FeaturesGrid />
    </>
  );
};

export default Home;
Home.getLayout = (page) => {
  return <HomePageLayout>{page}</HomePageLayout>;
};
