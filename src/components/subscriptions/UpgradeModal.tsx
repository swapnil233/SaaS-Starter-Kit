import { getPlanConfig } from "@/lib/subscriptions/plan-limits";
import { useSubscription } from "@/hooks/subscription/useSubscription";
import { useSubscriptionUpgrade } from "@/hooks/subscription/useSubscriptionUpgrade";
import { useTrialEligibility } from "@/hooks/subscription/useTrialEligibility";
import {
  Badge,
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
  Title,
  Loader,
  Alert,
  Switch,
} from "@mantine/core";
import { BillingInterval, SubscriptionPlan } from "@prisma/client";
import { IconCheck, IconInfoCircle } from "@tabler/icons-react";
import { FC, useState } from "react";

interface UpgradeModalProps {
  opened: boolean;
  onClose: () => void;
}

const UpgradeModal: FC<UpgradeModalProps> = ({ opened, onClose }) => {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(
    BillingInterval.MONTHLY
  );

  const { subscription, error, setError } = useSubscription();
  const { data: trialEligibility, isLoading: trialLoading } =
    useTrialEligibility();
  const { handleUpgrade, actionLoading, loadingPlan } =
    useSubscriptionUpgrade(setError);

  const proConfig = getPlanConfig(SubscriptionPlan.PRO);
  const currentPrice =
    billingInterval === BillingInterval.YEARLY
      ? proConfig.yearlyPrice
      : proConfig.monthlyPrice;
  const intervalText =
    billingInterval === BillingInterval.YEARLY ? "year" : "month";

  const isYearly = billingInterval === BillingInterval.YEARLY;
  const savings =
    isYearly && proConfig.monthlyPrice > 0
      ? proConfig.monthlyPrice * 12 - proConfig.yearlyPrice
      : 0;

  const handlePlanUpgrade = () => {
    if (subscription?.plan === SubscriptionPlan.PRO) {
      onClose();
      return;
    }

    // Enable trial if user is eligible and upgrading to PRO
    const enableTrial = trialEligibility?.isEligible && !trialLoading;

    handleUpgrade(SubscriptionPlan.PRO, billingInterval, enableTrial);
  };

  const toggleBilling = () => {
    setBillingInterval(
      billingInterval === BillingInterval.MONTHLY
        ? BillingInterval.YEARLY
        : BillingInterval.MONTHLY
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Title order={3}>Upgrade to Pro</Title>}
      size="md"
      centered
    >
      <Stack gap="lg">
        {error && (
          <Alert color="red" icon={<IconInfoCircle size={16} />}>
            {error}
          </Alert>
        )}

        {/* Billing Toggle */}
        <Card withBorder p="sm">
          <Group justify="center">
            <Text
              size="sm"
              c={
                billingInterval === BillingInterval.MONTHLY ? "blue" : "dimmed"
              }
            >
              Monthly
            </Text>
            <Switch
              checked={billingInterval === BillingInterval.YEARLY}
              onChange={toggleBilling}
              size="md"
            />
            <Group gap={4}>
              <Text
                size="sm"
                c={
                  billingInterval === BillingInterval.YEARLY ? "blue" : "dimmed"
                }
              >
                Yearly
              </Text>
              {isYearly && savings > 0 && (
                <Badge color="green" size="sm">
                  Save ${savings}
                </Badge>
              )}
            </Group>
          </Group>
        </Card>

        {/* Plan Card */}
        <Card withBorder p="lg">
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <div>
                <Group align="center" gap="xs">
                  <Title order={4}>{proConfig.name}</Title>
                  <Badge color="pink" variant="light">
                    Popular
                  </Badge>
                </Group>
                <Text c="dimmed" size="sm" mt={4}>
                  {proConfig.description}
                </Text>
              </div>
            </Group>

            <Group align="baseline" gap="xs">
              <Text size="2rem" fw={700} c="blue">
                ${currentPrice}
              </Text>
              <Text c="dimmed">/{intervalText}</Text>
            </Group>

            {/* Trial Info */}
            {!trialLoading && trialEligibility?.isEligible && (
              <Alert color="green" icon={<IconCheck size={16} />}>
                <Text size="sm">
                  <strong>14-day free trial included!</strong> You can try Pro
                  features risk-free.
                </Text>
              </Alert>
            )}

            {/* Features */}
            <Stack gap="xs" mt="sm">
              <Text fw={500} size="sm">
                What&apos;s included:
              </Text>
              {proConfig.features.slice(0, 6).map((feature, index) => (
                <Group key={index} gap="xs" align="flex-start">
                  <IconCheck size={16} color="green" style={{ marginTop: 2 }} />
                  <Text size="sm" c="dimmed">
                    {feature}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Stack>
        </Card>

        {/* Action Buttons */}
        <Group gap="sm">
          <Button
            variant="default"
            onClick={onClose}
            fullWidth
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePlanUpgrade}
            fullWidth
            loading={actionLoading && loadingPlan === SubscriptionPlan.PRO}
            disabled={subscription?.plan === SubscriptionPlan.PRO}
            leftSection={
              subscription?.plan === SubscriptionPlan.PRO ? (
                <IconCheck size={16} />
              ) : actionLoading ? (
                <Loader size={16} />
              ) : undefined
            }
          >
            {subscription?.plan === SubscriptionPlan.PRO
              ? "Already Pro"
              : trialEligibility?.isEligible && !trialLoading
                ? "Start Free Trial"
                : `Upgrade to Pro - $${currentPrice}/${intervalText}`}
          </Button>
        </Group>

        <Text size="xs" c="dimmed" ta="center">
          You&apos;ll be redirected to Stripe to complete your payment securely.
        </Text>
      </Stack>
    </Modal>
  );
};

export default UpgradeModal;
