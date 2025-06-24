import app from "@/lib/app";
import { BillingInterval, SubscriptionPlan } from "@prisma/client";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface SubscriptionCancelledEmailProps {
  currentPlan: SubscriptionPlan;
  billingInterval: BillingInterval;
  accessEndDate: string;
  dashboardLink: string;
}

export default function SubscriptionCancelledEmail({
  currentPlan,
  billingInterval,
  accessEndDate,
  dashboardLink,
}: SubscriptionCancelledEmailProps) {
  const previewText = `Your subscription has been cancelled`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body className="bg-white font-sans">
        <Container className="mx-auto p-[20px] max-w-[600px]">
          <Heading className="text-[24px] font-normal text-center p-0 my-[30px] mx-0">
            Subscription Cancelled
          </Heading>

          <Section className="bg-white border border-solid border-[#eaeaea] rounded mb-[16px] p-[30px]">
            <Text className="text-black text-[14px] leading-[24px]">
              Hello,
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Your subscription has been cancelled.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              <strong>Important Information:</strong>
              <br />
              You will continue to have access to the{" "}
              <strong>{currentPlan.toUpperCase()}</strong> plan features until{" "}
              <strong>{accessEndDate}</strong>.
              <br />
              After this date, your subscription will be automatically
              downgraded to the FREE plan with limited features.
              <br />
              Your account data will be preserved, but some functionality may
              become unavailable.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              <strong>Current Plan Details:</strong>
              <br />
              Plan: {currentPlan.toUpperCase()}
              <br />
              Billing interval: {billingInterval.toUpperCase()}
              <br />
              Access ends: {accessEndDate}
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              If you wish to reactivate your subscription before it expires, you
              can do so from your account settings.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-[20px] py-[12px]"
                href={dashboardLink}
              >
                Go to your dashboard
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              or copy and paste this URL into your browser:{" "}
              <Link href={dashboardLink} className="text-blue-600 no-underline">
                {dashboardLink}
              </Link>
            </Text>
          </Section>

          <Text className="text-[#666666] text-[12px] leading-[24px]">
            This message was sent to you by {app.name}. If you have any
            questions, please contact our support team.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
