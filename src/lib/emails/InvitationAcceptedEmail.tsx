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

interface InvitationAcceptedEmailProps {
  newMemberName?: string;
  newMemberEmail?: string;
  teamName?: string;
  teamLink?: string;
  recipientName?: string;
}

export const InvitationAcceptedEmail = ({
  newMemberName = "John Doe",
  newMemberEmail = "john.doe@example.com",
  teamName = "Acme Inc.",
  teamLink = "https://qualsearch.io/teams",
  recipientName = "Team Creator",
}: InvitationAcceptedEmailProps) => {
  const previewText = `${newMemberName} just joined your team ${teamName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              New member joined <strong>{teamName}</strong>
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {recipientName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              <strong>{newMemberName}</strong> (
              <Link
                href={`mailto:${newMemberEmail}`}
                className="text-blue-600 no-underline"
              >
                {newMemberEmail}
              </Link>
              ) has accepted your invitation and joined the{" "}
              <strong>{teamName}</strong> team on <strong>QualSearch</strong>.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-[20px] py-[12px]"
                href={teamLink}
              >
                Go to team
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

export default InvitationAcceptedEmail;
