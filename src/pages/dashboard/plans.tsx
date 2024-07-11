import PricingCard from "@/components/marketing/pricing/PricingCard";
import DashboardLayout from "@/components/shared/layouts/DashboardLayout";
import SharedHead from "@/components/shared/SharedHead";
import { pricingPlans } from "@/lib/stripe/pricing";
import { NextPageWithLayout } from "@/pages/page";
import { Button, Group, SimpleGrid, Stack, Title } from "@mantine/core";
import { useState } from "react";

interface IPlansPageProps {}

const PlansPage: NextPageWithLayout<IPlansPageProps> = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const currentPlans =
    billingCycle === "monthly" ? pricingPlans.monthly : pricingPlans.yearly;
  return (
    <>
      <SharedHead title="Plans" />
      <Stack gap={"lg"}>
        <Title order={2}>Plans</Title>
        <Group gap={"xs"}>
          <Button
            onClick={() => setBillingCycle("monthly")}
            variant={billingCycle === "monthly" ? "filled" : "default"}
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === "yearly" ? "filled" : "default"}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly
          </Button>
        </Group>
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing={{ base: 10, sm: "xl" }}
          verticalSpacing={{ base: "md", sm: "xl" }}
        >
          {currentPlans.map((plan, index) => (
            <PricingCard key={index} {...plan} billingCycle={billingCycle} />
          ))}
          {pricingPlans.oneTime.map((plan, index) => (
            <PricingCard key={index} {...plan} billingCycle="oneTime" />
          ))}
        </SimpleGrid>
      </Stack>
    </>
  );
};

export default PlansPage;
PlansPage.getLayout = (page) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};
