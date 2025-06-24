import { getPlanPrice, PlanPricing } from "@/lib/subscriptions/plan-limits";
import {
  createSubscriptionIntentUrl,
  saveSubscriptionIntent,
} from "@/lib/subscriptions/subscription-intent";
import { Badge, Button, Group } from "@mantine/core";
import { BillingInterval, SubscriptionPlan } from "@prisma/client";
import { IconCheck } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";

interface PricingCardProps {
  plan: SubscriptionPlan;
  config: PlanPricing;
  billingInterval: BillingInterval;
}

const PricingCard: FC<PricingCardProps> = ({
  plan,
  config,
  billingInterval,
}) => {
  const session = useSession();
  const router = useRouter();

  const currentPrice = getPlanPrice(plan, billingInterval);
  const isYearly = billingInterval === BillingInterval.YEARLY;
  const intervalText = isYearly ? "year" : "month";

  const handleSubscriptionClick = () => {
    // Create subscription intent
    const intent = {
      plan,
      billingInterval,
      timestamp: Date.now(),
    };

    if (session.data?.user) {
      // User is authenticated - save intent and redirect to dashboard with upgrade modal
      saveSubscriptionIntent(intent);
      const dashboardUrl = createSubscriptionIntentUrl("/dashboard", intent);
      router.push(dashboardUrl);
    } else {
      // User is not authenticated - save intent and redirect to signin
      saveSubscriptionIntent(intent);
      const callbackUrl = createSubscriptionIntentUrl("/dashboard", intent);
      router.push(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-sm flex flex-col">
      <Group justify="space-between">
        <h3 className="text-xl font-semibold text-gray-900">{config.name}</h3>
        {config.isPopular && (
          <Badge variant="gradient" gradient={{ from: "pink", to: "yellow" }}>
            Popular
          </Badge>
        )}
      </Group>
      <p className="mt-4 text-gray-600">{config.description}</p>
      <div className="mt-6 text-4xl font-extrabold text-gray-900">
        {currentPrice > 0 ? (
          <>
            ${currentPrice.toLocaleString()}
            <span className="text-sm text-neutral-500">/{intervalText}</span>
            {isYearly && config.monthlyPrice > 0 && (
              <div className="text-sm text-green-600 font-normal">
                Save $
                {(
                  config.monthlyPrice * 12 -
                  config.yearlyPrice
                ).toLocaleString()}
                /year
              </div>
            )}
          </>
        ) : (
          "Free"
        )}
      </div>
      <ul className="mt-6 space-y-4 flex-grow">
        {config.features.map((feature, index) => (
          <li key={index} className="text-gray-600 flex items-center">
            <IconCheck className="w-6 h-6 text-green-500 mr-2" />
            {feature}
          </li>
        ))}
      </ul>
      {plan === SubscriptionPlan.FREE ? (
        <Button
          variant={config.isPopular ? "filled" : "default"}
          mt={24}
          fullWidth
          radius="xs"
          component={Link}
          href={session.data?.user ? "/dashboard" : "/signin"}
        >
          Get Started
        </Button>
      ) : (
        <Button
          variant={config.isPopular ? "filled" : "default"}
          mt={24}
          fullWidth
          radius="xs"
          onClick={handleSubscriptionClick}
        >
          Upgrade Now
        </Button>
      )}
    </div>
  );
};

export default PricingCard;
