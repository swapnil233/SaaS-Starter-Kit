import { pricingPlans } from "@/lib/stripe/pricing";
import { Switch } from "@mantine/core";
import { useState } from "react";
import PricingCard from "./PricingCard";
import PricingTitle from "./PricingTitle";

const PricingSection: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const toggleBilling = () => {
    setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly");
  };

  const currentPlans =
    billingCycle === "monthly" ? pricingPlans.monthly : pricingPlans.yearly;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PricingTitle />
        <div className="mt-6 flex justify-center items-center">
          <span className="mr-3 text-gray-700">Monthly</span>
          <Switch
            onChange={toggleBilling}
            size="lg"
            checked={billingCycle === "yearly"}
          />
          <span className="ml-3 text-gray-700">Yearly</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
          {currentPlans.map((plan, index) => (
            <PricingCard key={index} {...plan} billingCycle={billingCycle} />
          ))}
          {pricingPlans.oneTime.map((plan, index) => (
            <PricingCard key={index} {...plan} billingCycle="oneTime" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
