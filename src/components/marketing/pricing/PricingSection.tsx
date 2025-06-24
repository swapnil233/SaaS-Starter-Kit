import { getAllPlansForMarketing } from "@/lib/subscriptions/plan-limits";
import { Switch } from "@mantine/core";
import { BillingInterval } from "@prisma/client";
import { useState } from "react";
import PricingCard from "./PricingCard";
import PricingTitle from "./PricingTitle";

const PricingSection: React.FC = () => {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(
    BillingInterval.MONTHLY
  );

  const toggleBilling = () => {
    setBillingInterval(
      billingInterval === BillingInterval.MONTHLY
        ? BillingInterval.YEARLY
        : BillingInterval.MONTHLY
    );
  };

  const allPlans = getAllPlansForMarketing();

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PricingTitle />
        <div className="mt-6 flex justify-center items-center">
          <span className="mr-3 text-gray-700">Monthly</span>
          <Switch
            onChange={toggleBilling}
            size="lg"
            checked={billingInterval === BillingInterval.YEARLY}
          />
          <span className="ml-3 text-gray-700">
            Yearly {billingInterval === BillingInterval.YEARLY && "(Save ~$40)"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12 max-w-4xl mx-auto">
          {allPlans.map(({ plan, config }) => (
            <PricingCard
              key={plan}
              plan={plan}
              config={config}
              billingInterval={billingInterval}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
