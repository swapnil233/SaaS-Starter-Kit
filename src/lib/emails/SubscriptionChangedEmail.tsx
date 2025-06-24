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

interface SubscriptionChangedEmailProps {
  isUpgrade: boolean;
  previousPlan: SubscriptionPlan;
  newPlan: SubscriptionPlan;
  billingInterval: BillingInterval;
  totalPrice?: number;
  effectiveDate: string;
  dashboardLink: string;
  invoiceUrl?: string;
  customMessage?: string;
}

export default function SubscriptionChangedEmail({
  isUpgrade,
  previousPlan,
  newPlan,
  billingInterval,
  totalPrice,
  effectiveDate,
  dashboardLink,
  invoiceUrl,
  customMessage,
}: SubscriptionChangedEmailProps) {
  const previewText = isUpgrade
    ? `Your subscription has been upgraded from ${previousPlan.toUpperCase()} to ${newPlan.toUpperCase()}`
    : `Your subscription has been changed from ${previousPlan.toUpperCase()} to ${newPlan.toUpperCase()}`;

  const formattedBillingInterval =
    billingInterval === BillingInterval.YEARLY ? "year" : "month";
  const pricingText = totalPrice
    ? `$${totalPrice} per ${formattedBillingInterval}`
    : "";

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body className="bg-white font-sans">
        <Container className="mx-auto p-[20px] max-w-[600px]">
          <Heading className="text-[24px] font-normal text-center p-0 my-[30px] mx-0">
            {isUpgrade ? "Subscription Upgraded" : "Subscription Changed"}
          </Heading>

          <Section className="bg-white border border-solid border-[#eaeaea] rounded mb-[16px] p-[30px]">
            <Text className="text-black text-[14px] leading-[24px]">
              Hello,
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Your subscription has been
              {isUpgrade ? " upgraded " : " changed "}
              from <strong>{previousPlan.toUpperCase()}</strong> to{" "}
              <strong>{newPlan.toUpperCase()}</strong>.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              <strong>New Plan Details:</strong>
              <br />
              Plan: {newPlan.toUpperCase()}
              <br />
              Billing interval: {billingInterval.toUpperCase()}
              {pricingText && (
                <>
                  <br />
                  Price: {pricingText}
                </>
              )}
              <br />
              Effective date: {effectiveDate}
            </Text>

            {customMessage && (
              <Text className="text-black text-[14px] leading-[24px] font-semibold">
                {customMessage}
              </Text>
            )}

            {isUpgrade && (
              <Text className="text-black text-[14px] leading-[24px]">
                Thank you for upgrading your subscription. You now have access
                to additional features and capabilities.
              </Text>
            )}

            {invoiceUrl && (
              <Text className="text-black text-[14px] leading-[24px]">
                You can view your invoice here:{" "}
                <Link href={invoiceUrl} className="text-blue-600 no-underline">
                  View Invoice
                </Link>
              </Text>
            )}

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
