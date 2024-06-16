import { FC } from "react";
import { useSession } from "next-auth/react";
import { Badge, Button, Group } from "@mantine/core";
import Link from "next/link";
import { PricingPlan } from "@/lib/stripe/pricing";
import { IconCheck } from "@tabler/icons-react";
import { getSubscriptionLink } from "@/lib/stripe/getSubscriptionLink";

interface PricingCardProps extends PricingPlan {
  billingCycle: "monthly" | "yearly" | "oneTime" | "free";
}

const PricingCard: FC<PricingCardProps> = ({
  title,
  description,
  price,
  features,
  isPopular = false,
  billingCycle,
  purchaseLink,
}) => {
  const session = useSession();

  return (
    <div className="bg-white p-6 rounded-md shadow-sm flex flex-col">
      <Group justify="space-between">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        {isPopular && (
          <Badge variant="gradient" gradient={{ from: "pink", to: "yellow" }}>
            Popular
          </Badge>
        )}
      </Group>
      <p className="mt-4 text-gray-600">{description}</p>
      <div className="mt-6 text-4xl font-extrabold text-gray-900">
        {price > 0 ? (
          <>
            ${price.toLocaleString()}
            <span className="text-sm text-neutral-500">
              /{billingCycle === "oneTime" ? "one-time" : billingCycle}
            </span>
          </>
        ) : (
          "Free"
        )}
      </div>
      <ul className="mt-6 space-y-4 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="text-gray-600 flex items-center">
            <IconCheck className="w-6 h-6 text-green-500 mr-2" />
            {feature}
          </li>
        ))}
      </ul>
      <Button
        variant={isPopular ? "filled" : "default"}
        mt={24}
        fullWidth
        radius="xs"
        component={Link}
        target="_blank"
        href={getSubscriptionLink(session, purchaseLink)}
      >
        Get started
      </Button>
    </div>
  );
};

export default PricingCard;
