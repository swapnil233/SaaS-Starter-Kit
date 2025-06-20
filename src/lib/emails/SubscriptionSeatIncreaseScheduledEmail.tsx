import app from "@/lib/app";
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

interface SubscriptionSeatIncreaseScheduledEmailProps {
  teamName: string;
  currentQuantity: number;
  scheduledQuantity: number;
  effectiveDate: string;
  teamLink: string;
  // Optional: Add invoice details if an immediate charge happens for increases
  // invoiceUrl?: string;
  // totalPrice?: number;
}

export default function SubscriptionSeatIncreaseScheduledEmail({
  teamName,
  currentQuantity,
  scheduledQuantity,
  effectiveDate,
  teamLink,
}: SubscriptionSeatIncreaseScheduledEmailProps) {
  const previewText = `Your ${teamName} seat quantity is scheduled to increase.`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Subscription Updated
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello,
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              As requested, your team&apos;s seat quantity for{" "}
              <strong>{teamName}</strong> is scheduled to increase from{" "}
              <strong>{currentQuantity}</strong> to{" "}
              <strong>{scheduledQuantity}</strong> effective{" "}
              <strong>{effectiveDate}</strong>.
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              If this change results in an immediate charge or proration, you
              will receive a separate invoice.
            </Text>

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
            <Text className="text-[#666666] text-[12px] leading-[24px] mt-[16px]">
              This message was sent to you by {app.name}. If you have any
              questions, please contact our support team.
            </Text>
            <Text className="text-[#666666] text-[12px] leading-[24px] mt-[16px]">
              Thank you!
              <br />
              {app.name}
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
