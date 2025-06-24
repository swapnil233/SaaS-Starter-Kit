import SharedHead from "@/components/shared/SharedHead";
import { SignUp } from "@clerk/nextjs";
import { Box, Center, Container } from "@mantine/core";

export default function SignUpPage() {
  return (
    <>
      <SharedHead title="Sign Up" />
      <Container size="sm" py="xl">
        <Center>
          <Box w="100%" maw={400}>
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              fallbackRedirectUrl="/dashboard"
              signInFallbackRedirectUrl="/dashboard"
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
