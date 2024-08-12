import { Dispatch, SetStateAction } from "react";

import { ActionIcon, Button, Card, Group, Stack, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import Link from "next/link";

export default function ProBanner({
  setShowProBanner,
}: {
  setShowProBanner: Dispatch<SetStateAction<boolean | null>>;
}) {
  const handleHideBanner = () => {
    setShowProBanner(false);
  };

  return (
    <Card withBorder>
      <Stack>
        <Stack gap={8}>
          <Group justify="space-between">
            <Text size="md" fw={"bold"}>
              Upgrade plan
            </Text>
            <ActionIcon
              variant="subtle"
              aria-label="Close"
              onClick={handleHideBanner}
            >
              <IconX style={{ width: "70%", height: "70%" }} stroke={1.5} />
            </ActionIcon>
          </Group>
          <Text size="sm">Unlock more features with our paid plans.</Text>
        </Stack>
        <Button
          component={Link}
          href="/dashboard/plans"
          type="button"
          fullWidth
          size="sm"
          variant="outline"
        >
          Upgrade
        </Button>
      </Stack>
    </Card>
  );
}
