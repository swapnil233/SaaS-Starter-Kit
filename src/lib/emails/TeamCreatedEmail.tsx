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
  Tailwind,
  Text,
} from "@react-email/components";

interface TeamCreatedEmailProps {
  teamName: string;
  creatorName: string;
  teamLink: string;
  isPaidPlan: boolean;
  planName?: string;
  billingInterval?: string;
  seatCount?: number;
  pricePerSeat?: number;
  totalPrice?: number;
  invoiceUrl?: string;
  renewalDate?: string;
}

export const TeamCreatedEmail = ({
  teamName = "New Team",
  creatorName = "User",
  teamLink = "https://qualsearch.io/teams",
  isPaidPlan = false,
  planName = SubscriptionPlan.FREE,
  billingInterval = BillingInterval.MONTHLY,
  seatCount = 1,
  pricePerSeat = 0,
  totalPrice = 0,
  invoiceUrl = "",
  renewalDate,
}: TeamCreatedEmailProps) => {
  const previewText = `Welcome to ${app.name}! Your team ${teamName} has been created.`;
  const formattedBillingInterval = billingInterval.toLowerCase();

  const formattedPricePerSeat = pricePerSeat?.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  const formattedTotalPrice = totalPrice?.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Team Created Successfully
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {creatorName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Your team <strong>{teamName}</strong> has been successfully
              created on <strong>QualSearch</strong>.
            </Text>

            {isPaidPlan && (
              <>
                <Section className="bg-gray-50 p-[15px] rounded my-[20px]">
                  <Heading className="text-black text-[18px] font-normal mb-[10px]">
                    Subscription Details
                  </Heading>
                  <Text className="text-black text-[14px] leading-[24px] m-0">
                    <strong>Plan:</strong> {planName}
                  </Text>
                  <Text className="text-black text-[14px] leading-[24px] m-0">
                    <strong>Billing:</strong> {formattedBillingInterval}
                  </Text>
                  <Text className="text-black text-[14px] leading-[24px] m-0">
                    <strong>Seats:</strong> {seatCount}
                  </Text>
                  <Text className="text-black text-[14px] leading-[24px] m-0">
                    <strong>Price per seat:</strong> {formattedPricePerSeat}
                  </Text>
                  <Text className="text-black text-[14px] leading-[24px] m-0 font-bold">
                    <strong>Total:</strong> {formattedTotalPrice}
                  </Text>
                  {renewalDate && (
                    <Text className="text-black text-[14px] leading-[24px] m-0">
                      <strong>Renews on:</strong> {renewalDate}
                    </Text>
                  )}
                </Section>

                {invoiceUrl && (
                  <Text className="text-black text-[14px] leading-[24px]">
                    You can{" "}
                    <Link
                      href={invoiceUrl}
                      className="text-blue-600 no-underline"
                    >
                      view your invoice online
                    </Link>
                    .
                  </Text>
                )}
              </>
            )}

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-[20px] py-[12px]"
                href={teamLink}
              >
                Go to your team projects
              </Button>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              or copy and paste this URL into your browser:{" "}
              <Link href={teamLink} className="text-blue-600 no-underline">
                {teamLink}
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default TeamCreatedEmail;
