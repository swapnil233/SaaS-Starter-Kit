import {
  ThemeIcon,
  Text,
  Title,
  Container,
  SimpleGrid,
  rem,
} from "@mantine/core";
import classes from "./FeaturesGrid.module.css";
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
    <Container className={classes.wrapper}>
      <Title className={classes.title}>
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

      <Container size={560} p={0}>
        <Text size="sm" className={classes.description}>
          This starter kit takes care of all the annoying tasks, like setting up
          authentication, setting up Stripe, etc., so you can just focus on
          building the next big thing.
        </Text>
      </Container>

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
