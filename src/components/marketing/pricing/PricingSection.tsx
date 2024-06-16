import { useState } from "react";
import PricingTitle from "./PricingTitle";
import BillingSwitch from "./BillingSwitch";
import PricingCard from "./PricingCard";
import { pricingPlans } from "@/lib/stripe/pricing";

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
        <BillingSwitch
          isYearly={billingCycle === "yearly"}
          toggleBilling={toggleBilling}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
          {currentPlans.map((plan, index) => (
            <PricingCard key={index} {...plan} billingCycle={billingCycle} />
          ))}
          {pricingPlans.oneTime.map((plan, index) => (
            <PricingCard key={index} {...plan} billingCycle="oneTime" />
          ))}
          {pricingPlans.free.map((plan, index) => (
            <PricingCard key={index} {...plan} billingCycle="free" />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
