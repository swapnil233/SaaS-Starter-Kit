import app from "@/lib/app";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PasswordResetConfirmationEmailProps {
  name: string;
  subject: string;
}

export const PasswordResetConfirmationEmail = ({
  name,
  subject,
}: PasswordResetConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>{subject}</Preview>
    <Preview>
      Your password for {app.name} has been changed successfully.
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={paragraph}>Hi {name},</Text>
        <Text style={paragraph}>
          We’re writing to let you know that your password for {app.name} has
          been successfully updated.
        </Text>
        <Text style={paragraph}>
          If you didn’t make this change or believe your account has been
          compromised, please contact us immediately.
        </Text>
        <Section style={contactContainer}>
          <Text style={paragraph}>
            Contact Support:{" "}
            <a
              href={`mailto:support@${app.name.toLowerCase()}.com`}
              style={link}
            >
              support@{app.name.toLowerCase()}.com
            </a>
          </Text>
        </Section>
        <Text style={paragraph}>
          Best,
          <br />
          The {app.name} team
        </Text>
        <Hr style={hr} />
        <Text style={footer}>123 Elmo Street, Toronto, ON A1A A1A Canada</Text>
      </Container>
    </Body>
  </Html>
);

PasswordResetConfirmationEmail.PreviewProps = {
  name: "Hasan Iqbal",
  subject: `Your password has been changed for ${app.name}`,
} as PasswordResetConfirmationEmailProps;

export default PasswordResetConfirmationEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
};

const contactContainer = {
  marginTop: "20px",
};

const link = {
  color: "#5F51E8",
  textDecoration: "none",
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
};
