import {
  Button,
  Container,
  Head,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import EmailLayout from "./EmailLayout";
import app from "@/lib/app";

interface WelcomeEmailProps {
  name: string;
  subject: string;
}

const WelcomeEmail = ({ name, subject }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{subject}</Preview>
      <EmailLayout>
        <Text>Hi {name},</Text>
        <Text>Welcome to {app.name}!</Text>
        <Text>Click the link below to login now:</Text>
        <Container className="text-center">
          <Button
            href={`localhost:3000/signin`}
            className="bg-brand text-white font-medium py-2 px-4 rounded"
          >
            Login to your account
          </Button>
        </Container>
      </EmailLayout>
    </Html>
  );
};

export default WelcomeEmail;
