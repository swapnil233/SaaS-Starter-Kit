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

interface InvitationDeclinedEmailProps {
  declinedByName?: string;
  declinedByEmail?: string;
  teamName?: string;
  teamLink?: string;
  recipientName?: string;
}

export const InvitationDeclinedEmail = ({
  declinedByName = "John Doe",
  declinedByEmail = "john.doe@example.com",
  teamName = "Acme Inc.",
  teamLink = "https://qualsearch.io/teams",
  recipientName = "Team Administrator",
}: InvitationDeclinedEmailProps) => {
  const previewText = `${declinedByName} declined your invitation to ${teamName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Invitation Declined
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {recipientName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>{declinedByName}</strong> (
              <Link
                href={`mailto:${declinedByEmail}`}
                className="text-blue-600 no-underline"
              >
                {declinedByEmail}
              </Link>
              ) has declined your invitation to join the{" "}
              <strong>{teamName}</strong> team on <strong>QualSearch</strong>.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-[20px] py-[12px]"
                href={teamLink}
              >
                Manage your team
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

export default InvitationDeclinedEmail;
