import DeleteAccountModal from "@/components/modals/DeleteAccountModal";
import { Card, Grid, Group, Stack, Text } from "@mantine/core";
import { Account } from "@prisma/client";

interface DeleteAccountSectionProps {
  handleDeleteAccount: (_data: {
    password?: string;
    confirmText?: string;
  }) => Promise<void>;
  isLoading: boolean;
  account: Account | null;
}

const DeleteAccountSection = ({
  handleDeleteAccount,
  isLoading,
  account,
}: DeleteAccountSectionProps) => {
  return (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Stack gap="xs">
          <Text fw={500} size="lg">
            Delete account
          </Text>
          <Text c="dimmed">Deleting your account is irreversible.</Text>
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Card radius="md" withBorder p={0}>
          <Group px={{ base: 16, md: 32 }} py={{ base: 16, md: 32 }}>
            <DeleteAccountModal
              onConfirm={handleDeleteAccount}
              isLoading={isLoading}
              accountType={account?.type}
            />
          </Group>
        </Card>
      </Grid.Col>
    </Grid>
  );
};

export default DeleteAccountSection;
