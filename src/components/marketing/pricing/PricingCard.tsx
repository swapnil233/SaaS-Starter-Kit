import { Badge, Button, Group } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

interface PricingCardProps {
  title: string;
  description: string;
  price?: number;
  oneTimePurchase?: boolean;
  features: string[];
  isPopular?: boolean;
  isYearly: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  description,
  price,
  oneTimePurchase = false,
  features,
  isPopular = false,
  isYearly = false,
}) => {
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
        {price !== undefined ? (
          <>
            ${price.toLocaleString()}
            <span className="text-sm text-neutral-500 ">
              /{oneTimePurchase ? "one-time" : isYearly ? "year" : "month"}
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
      >
        Get started
      </Button>
    </div>
  );
};

export default PricingCard;
