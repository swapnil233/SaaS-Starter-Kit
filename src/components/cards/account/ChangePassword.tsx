import { useChangePasswordForm } from "@/hooks/useChangePasswordForm";
import {
  Alert,
  Button,
  Card,
  Grid,
  Group,
  PasswordInput,
  Stack,
  Text,
} from "@mantine/core";
import { Account } from "@prisma/client";
import { IconInfoCircle } from "@tabler/icons-react";

interface ChangePasswordProps {
  account: Account | null;
}

const ChangePassword = ({ account }: ChangePasswordProps) => {
  const { register, handleSubmit, onSubmit, isLoading } =
    useChangePasswordForm(account);

  const isOAuthAccount = account?.type === "oauth";
  const canChangePassword = account?.type === "credentials";

  return (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Stack gap="xs">
          <Text fw={500} size="lg">
            Change your password
          </Text>
          <Text c="dimmed">
            If you think your password may have been compromised, you may change
            it here.
          </Text>
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Card radius="md" withBorder p={0}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack>
              <Stack
                gap={24}
                px={{ base: 16, md: 32 }}
                py={{ base: 16, md: 32 }}
              >
                {isOAuthAccount && (
                  <Alert variant="light" color="blue" icon={<IconInfoCircle />}>
                    <Text>
                      You can&apos;t change your password because your account
                      is verified with{" "}
                      {account?.provider.charAt(0).toUpperCase() +
                        account?.provider.slice(1)}
                      .
                    </Text>
                  </Alert>
                )}
                {!canChangePassword && !isOAuthAccount && (
                  <Alert
                    variant="light"
                    color="orange"
                    icon={<IconInfoCircle />}
                  >
                    <Text>
                      Password change is not available for this account type or
                      setup.
                    </Text>
                  </Alert>
                )}
                <PasswordInput
                  radius="xs"
                  label="Current password"
                  required
                  disabled={!canChangePassword}
                  {...register("currentPassword")}
                />
                <PasswordInput
                  radius="xs"
                  label="New password"
                  disabled={!canChangePassword}
                  {...register("newPassword")}
                />
                <PasswordInput
                  radius="xs"
                  label="Confirm new password"
                  disabled={!canChangePassword}
                  {...register("confirmNewPassword")}
                />
              </Stack>
              <div className="h-[1px] w-full bg-[#D6D6D6]"></div>
              <Group justify="flex-start" px={{ base: 16, md: 32 }} pb={16}>
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={!canChangePassword}
                >
                  Save changes
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      </Grid.Col>
    </Grid>
  );
};

export default ChangePassword;
