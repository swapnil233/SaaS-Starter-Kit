import { FeaturesGrid } from "@/components/marketing/features/FeaturesGrid";
import { Footer } from "@/components/marketing/footer/Footer";
import { Hero } from "@/components/marketing/hero/Hero";
import { Navbar } from "@/components/marketing/navbar/Navbar";
import HomePageLayout from "@/components/shared/layouts/HomePageLayout";
import SharedHead from "@/components/shared/SharedHead";
import { PricingTable } from "@clerk/nextjs";
import { Box, Container, Stack, Text, Title } from "@mantine/core";
import { NextPageWithLayout } from "./page";

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
      <div id="pricing">
        <Container py={64}>
          <Title fw={900} mb="md" ta="center">
            Simple{" "}
            <Text
              component="span"
              inherit
              variant="gradient"
              gradient={{ from: "pink", to: "yellow" }}
            >
              pricing
            </Text>{" "}
            that grows with you.
          </Title>

          <Stack align="center" mb={32}>
            <p className="text-base md:text-lg text-gray-600 max-w-[48rem] text-center">
              Choose the plan that fits your needs. Start free and scale as your
              project grows. No hidden fees, cancel anytime.
            </p>
          </Stack>
          <PricingTable />
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default Home;
Home.getLayout = (page) => {
  return <HomePageLayout>{page}</HomePageLayout>;
};
