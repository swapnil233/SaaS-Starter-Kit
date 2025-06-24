import {
  getSubscriptionIntent,
  setProBannerDismissed,
} from "@/lib/subscriptions/subscription-intent";
import { ActionIcon, Button, Card, Group, Stack, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";

interface ProBannerProps {
  setShowProBanner: Dispatch<SetStateAction<boolean | null>>;
  onUpgradeClick?: () => void;
}

export default function ProBanner({
  setShowProBanner,
  onUpgradeClick,
}: ProBannerProps) {
  const router = useRouter();

  const handleHideBanner = () => {
    setShowProBanner(false);
    setProBannerDismissed(true);
  };

  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      // Default behavior: check for existing intent or create new one
      const existingIntent = getSubscriptionIntent();
      if (existingIntent) {
        // Use existing intent - redirect to dashboard with modal
        router.push(
          `/dashboard?upgrade=true&plan=${existingIntent.plan}&interval=${existingIntent.billingInterval}`
        );
      } else {
        // No existing intent - go to plans page
        router.push("/dashboard/plans");
      }
    }
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
          onClick={handleUpgradeClick}
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
