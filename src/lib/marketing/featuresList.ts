import {
  Icon,
  IconBrandStripe,
  IconBug,
  IconGauge,
  IconLock,
  IconMail,
  IconMessage2,
  IconProps,
  IconUser,
} from "@tabler/icons-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

type Feature = {
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  title: string;
  description: string;
};

export const featuresList: Feature[] = [
  {
    icon: IconGauge,
    title: "Great developer experience",
    description:
      "Built with TypeScript for type safety and a smooth development workflow.",
  },
  {
    icon: IconLock,
    title: "User authentication",
    description:
      "OAuth as well as email/password authentication, including forgot-password.",
  },
  {
    icon: IconBrandStripe,
    title: "Subscription management",
    description:
      "Easily manage subscriptions with Stripe integration. Set up one-time payments, recurring payments, handle billing, and offer flexible plans.",
  },
  {
    icon: IconUser,
    title: "User settings",
    description:
      "Give users control with features to update their info, change passwords, and delete accounts. Built with user privacy and security in mind.",
  },
  {
    icon: IconMail,
    title: "Email notifications",
    description:
      "Keep your users informed with nodemailer and react-email. Send beautiful, responsive emails for notifications and updates.",
  },
  {
    icon: IconMessage2,
    title: "SEO optimization",
    description:
      "Boost your search engine rankings with built-in SEO features. Easily manage meta tags, sitemaps, and robots.txt to ensure your site is crawler-friendly.",
  },
  {
    icon: IconGauge,
    title: "Analytics",
    description:
      "Understand your users with Google Analytics integration. Track page views, user behavior, and more to make data-driven decisions.",
  },
  {
    icon: IconBug,
    title: "Error logging",
    description:
      "Stay on top of issues with Sentry for error tracking. Get real-time alerts and detailed reports to quickly fix bugs and improve your app.",
  },
];
