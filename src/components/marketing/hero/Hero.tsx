import { Button, Text, Title } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";
import Link from "next/link";

export function Hero() {
  return (
    <div className="py-20 md:py-40 px-4 bg-[#11284b] bg-cover bg-center bg-[linear-gradient(250deg,rgba(130,201,30,0)_0%,#062343_70%),url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8&auto=format&fit=crop&w=1080&q=80')]">
      <div className="container mx-auto max-w-[1100px] ">
        <Title className="text-white font-bold leading-[1.05] max-w-[500px] text-[48px] md:max-w-full md:text-[34px] md:leading-[1.15]">
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

        <Text className="text-white opacity-75 max-w-[500px] mt-7 md:max-w-full">
          Ship faster with Boilerplate - a Next.js (pages router) SaaS starter
          kit built to speed up development of B2C SaaS products. Features
          include a full authentication system, Stripe subscriptions, etc. Built
          with Mantine UI components.{" "}
        </Text>

        <Button
          size="lg"
          leftSection={<IconBrandGithub size={"1.4rem"} />}
          component={Link}
          href={"https://github.com/swapnil233/boilerplate"}
          rel="noopener noreferrer"
          target="_blank"
          className="mt-10"
        >
          View repository
        </Button>
      </div>
    </div>
  );
}
