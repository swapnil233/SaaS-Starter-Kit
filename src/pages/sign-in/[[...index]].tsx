import SharedHead from "@/components/shared/SharedHead";
import { SignIn } from "@clerk/nextjs";
import { Box, Center, Container } from "@mantine/core";

export default function SignInPage() {
  return (
    <>
      <SharedHead title="Sign In" />
      <Container size="sm" py="xl">
        <Center>
          <Box w="100%" maw={400}>
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              fallbackRedirectUrl="/dashboard"
              signUpFallbackRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                  card: "shadow-lg",
                },
              }}
            />
          </Box>
        </Center>
      </Container>
    </>
  );
}
