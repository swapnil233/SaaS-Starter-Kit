import { Title, Text } from "@mantine/core";

const PricingTitle: React.FC = () => (
  <div className="text-center mb-12 flex flex-col align-middle items-center">
    <Title
      className="font-extrabold mb-4 text-center sm:text-left"
      style={{ fontFamily: "Greycliff CF, var(--mantine-font-family)" }}
    >
      Various types of{" "}
      <Text
        component="span"
        inherit
        variant="gradient"
        gradient={{ from: "pink", to: "yellow" }}
      >
        pricing
      </Text>{" "}
      plans.
    </Title>
    <p className="text-base md:text-lg text-gray-600 max-w-[48rem] text-center">
      Configure various pricing plans, including all paid plans, a mix of free
      and paid plans, or just a single one-time purchase plan
    </p>
  </div>
);

export default PricingTitle;
