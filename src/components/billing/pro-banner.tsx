import { Dispatch, SetStateAction } from "react";

import { ActionIcon, Button, Card, Group, Stack, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

export default function ProBanner({
  setShowProBanner,
}: {
  setShowProBanner: Dispatch<SetStateAction<boolean | null>>;
}) {
  const handleHideBanner = () => {
    setShowProBanner(false);
  };

  const handleUpgrade = () => {
    // This will be replaced with Clerk's billing portal when you set it up
    // For now, you can redirect to Clerk's billing or show a message
    console.log("Redirect to Clerk billing portal");
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
          <Text size="sm">
            Unlock more features with Clerk&apos;s billing system.
          </Text>
        </Stack>
        <Button
          onClick={handleUpgrade}
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
