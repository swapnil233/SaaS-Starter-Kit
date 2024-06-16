import {
  ThemeIcon,
  Text,
  Title,
  Container,
  SimpleGrid,
  rem,
  Stack,
} from "@mantine/core";
import { featuresList } from "@/lib/marketing/featuresList";

interface FeatureProps {
  icon: React.FC<any>;
  title: React.ReactNode;
  description: React.ReactNode;
}

export function Feature({ icon: Icon, title, description }: FeatureProps) {
  return (
    <div>
      <ThemeIcon variant="light" size={40} radius={40}>
        <Icon style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
      </ThemeIcon>
      <Text mt="sm" mb={7}>
        {title}
      </Text>
      <Text size="sm" c="dimmed" lh={1.6}>
        {description}
      </Text>
    </div>
  );
}

export function FeaturesGrid() {
  const features = featuresList.map((feature, index) => (
    <Feature {...feature} key={index} />
  ));

  return (
    <Container py={64}>
      <Title fw={900} mb="md" ta="center">
        Focus on{" "}
        <Text
          component="span"
          inherit
          variant="gradient"
          gradient={{ from: "pink", to: "yellow" }}
        >
          building
        </Text>{" "}
        your app, not implementing auth.
      </Title>

      <Stack align="center">
        <p className="text-base md:text-lg text-gray-600 max-w-[48rem] text-center">
          This starter kit takes care of all the annoying tasks, like setting up
          authentication, setting up Stripe, etc., so you can just focus on
          building the next big thing.
        </p>
      </Stack>

      <SimpleGrid
        mt={60}
        cols={{ base: 1, sm: 2, md: 3 }}
        spacing={{ base: "xl", md: 50 }}
        verticalSpacing={{ base: "xl", md: 50 }}
      >
        {features}
      </SimpleGrid>
    </Container>
  );
}
