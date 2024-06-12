import { Container, Title, Text, Button } from "@mantine/core";
import classes from "./Hero.module.css";
import { IconBrandGithub } from "@tabler/icons-react";
import Link from "next/link";

export function Hero() {
  return (
    <div className={classes.root}>
      <Container size="lg">
        <div className={classes.inner}>
          <div className={classes.content}>
            <Title className={classes.title}>
              A{" "}
              <Text
                component="span"
                inherit
                variant="gradient"
                gradient={{ from: "pink", to: "yellow" }}
              >
                fully featured
              </Text>{" "}
              Next.js SaaS Starter Kit
            </Title>

            <Text className={classes.description} mt={30}>
              Ship faster with Boilerplate - a Next.js (pages router) SaaS
              starter kit built to speed up development of B2C SaaS products.
              Features include a full authentication system, Stripe
              subscriptions, etc. Built with Mantine UI components.{" "}
            </Text>

            <Button
              size="lg"
              className={classes.control}
              mt={40}
              leftSection={<IconBrandGithub size={"1.4rem"} />}
              component={Link}
              href={"https://github.com/swapnil233/boilerplate"}
              rel="noopener noreferrer"
              target="_blank"
            >
              View repository
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
