import { Title, Text } from "@mantine/core";

const PricingTitle: React.FC = () => (
  <div className="text-center mb-12 flex flex-col align-middle items-center">
    <Title
      className="font-extrabold mb-4 text-center sm:text-left"
      style={{ fontFamily: "Greycliff CF, var(--mantine-font-family)" }}
    >
      Simple{" "}
      <Text
        component="span"
        inherit
        variant="gradient"
        gradient={{ from: "pink", to: "yellow" }}
      >
        pricing
      </Text>{" "}
      for everyone.
    </Title>
    <p className="text-base md:text-lg text-gray-600 max-w-[48rem] text-center">
      Choose the perfect plan for your needs. Start free and upgrade as you
      grow. All plans include our core features with increasing limits and
      premium support.
    </p>
  </div>
);

export default PricingTitle;
