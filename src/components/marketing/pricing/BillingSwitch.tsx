import { Switch } from "@mantine/core";

interface BillingSwitchProps {
  isYearly: boolean;
  toggleBilling: () => void;
}

const BillingSwitch: React.FC<BillingSwitchProps> = ({
  isYearly,
  toggleBilling,
}) => (
  <div className="mt-6 flex justify-center items-center">
    <span className="mr-3 text-gray-700">Monthly</span>
    <Switch onChange={toggleBilling} size="lg" checked={isYearly} />
    <span className="ml-3 text-gray-700">Yearly</span>
  </div>
);

export default BillingSwitch;
