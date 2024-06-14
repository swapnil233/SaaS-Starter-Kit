import { useState } from "react";
import PricingTitle from "./PricingTitle";
import BillingSwitch from "./BillingSwitch";
import PricingCard from "./PricingCard";
import { getPricingPlans } from "@/lib/pricing";

const PricingSection: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);
  const pricingPlans = getPricingPlans(isYearly);

  const toggleBilling = () => {
    setIsYearly(!isYearly);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PricingTitle />
        <BillingSwitch isYearly={isYearly} toggleBilling={toggleBilling} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
          {pricingPlans.map((plan, index) => (
            <PricingCard
              key={index}
              title={plan.title}
              description={plan.description}
              price={plan.price}
              oneTimePurchase={plan.oneTimePurchase}
              features={plan.features}
              isPopular={plan.isPopular}
              isYearly={isYearly}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
