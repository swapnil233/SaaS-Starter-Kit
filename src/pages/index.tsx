import { NextPageWithLayout } from "./page";
import HomePageLayout from "@/components/shared/layouts/HomePageLayout";
import { Box } from "@mantine/core";
import { Navbar } from "@/components/marketing/navbar/Navbar";
import { Hero } from "@/components/marketing/hero/Hero";
import { FeaturesGrid } from "@/components/marketing/features/FeaturesGrid";
import { Footer } from "@/components/marketing/footer/Footer";
import SharedHead from "@/components/shared/SharedHead";

const Home: NextPageWithLayout = () => {
  return (
    <>
      <SharedHead />
      <Box maw={1400} m="0 auto" pt={"lg"} px={"md"}>
        <Navbar />
      </Box>
      <Hero />
      <div id="features">
        <FeaturesGrid />
      </div>
      <Footer />
    </>
  );
};

export default Home;
Home.getLayout = (page) => {
  return <HomePageLayout>{page}</HomePageLayout>;
};
