import { useSubscription } from "@/hooks/subscription/useSubscription";
import { useSubscriptionUpgrade } from "@/hooks/subscription/useSubscriptionUpgrade";
import { getPlanConfig } from "@/lib/subscriptions/plan-limits";
import {
  Alert,
  Badge,
  Button,
  Card,
  Grid,
  Group,
  Loader,
  Stack,
  Text,
} from "@mantine/core";
import { BillingInterval, SubscriptionPlan } from "@prisma/client";
import { IconCreditCard, IconInfoCircle } from "@tabler/icons-react";
import { useState } from "react";

const BillingSection = () => {
  const [error, setError] = useState("");
  const { subscription, isLoading } = useSubscription();
  const { handleManageSubscription, actionLoading } =
    useSubscriptionUpgrade(setError);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "green";
      case "ACTIVE_TRIALING":
        return "blue";
      case "PAST_DUE":
        return "yellow";
      case "CANCELED":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Active";
      case "ACTIVE_TRIALING":
        return "Trial";
      case "PAST_DUE":
        return "Past Due";
      case "CANCELED":
        return "Canceled";
      case "INCOMPLETE":
        return "Incomplete";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="xs">
            <Text fw={500} size="lg">
              Billing & Subscription
            </Text>
            <Text c="dimmed">
              Manage your subscription and billing information
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card radius="md" withBorder p={0}>
            <Stack gap={24} px={{ base: 16, md: 32 }} py={{ base: 16, md: 32 }}>
              <Group justify="center">
                <Loader size="sm" />
                <Text>Loading billing information...</Text>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    );
  }

  if (!subscription) {
    return (
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="xs">
            <Text fw={500} size="lg">
              Billing & Subscription
            </Text>
            <Text c="dimmed">
              Manage your subscription and billing information
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card radius="md" withBorder p={0}>
            <Stack gap={24} px={{ base: 16, md: 32 }} py={{ base: 16, md: 32 }}>
              <Alert color="red" icon={<IconInfoCircle size={16} />}>
                Unable to load billing information. Please try refreshing the
                page.
              </Alert>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    );
  }

  const planConfig = getPlanConfig(subscription.plan as SubscriptionPlan);
  const isFreePlan = subscription.plan === SubscriptionPlan.FREE;
  const currentPrice =
    subscription.billingInterval === BillingInterval.YEARLY
      ? planConfig.yearlyPrice
      : planConfig.monthlyPrice;
  const intervalText =
    subscription.billingInterval === BillingInterval.YEARLY ? "year" : "month";

  return (
    <Grid gutter="xl">
      <Grid.Col span={{ base: 12, md: 4 }}>
        <Stack gap="xs">
          <Text fw={500} size="lg">
            Billing & Subscription
          </Text>
          <Text c="dimmed">
            Manage your subscription and billing information
          </Text>
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Card radius="md" withBorder p={0}>
          <Stack>
            <Stack gap={24} px={{ base: 16, md: 32 }} py={{ base: 16, md: 32 }}>
              {error && (
                <Alert color="red" icon={<IconInfoCircle size={16} />}>
                  {error}
                </Alert>
              )}

              <Stack gap="md">
                {/* Current Plan */}
                <Group justify="space-between">
                  <Text fw={500}>Current Plan</Text>
                  <Group gap="xs">
                    <Text fw={600}>{planConfig.name}</Text>
                    <Badge
                      color={
                        subscription.plan === SubscriptionPlan.PRO
                          ? "blue"
                          : "gray"
                      }
                    >
                      {subscription.plan}
                    </Badge>
                  </Group>
                </Group>

                {/* Subscription Status */}
                <Group justify="space-between">
                  <Text fw={500}>Status</Text>
                  <Badge color={getStatusColor(subscription.status)}>
                    {getStatusLabel(subscription.status)}
                  </Badge>
                </Group>

                {/* Pricing */}
                {!isFreePlan && (
                  <Group justify="space-between">
                    <Text fw={500}>Price</Text>
                    <Text>
                      ${currentPrice}
                      {currentPrice > 0 ? `/${intervalText}` : ""}
                    </Text>
                  </Group>
                )}

                {/* Billing Interval */}
                {!isFreePlan && (
                  <Group justify="space-between">
                    <Text fw={500}>Billing</Text>
                    <Text tt="capitalize">
                      {subscription.billingInterval?.toLowerCase()}
                    </Text>
                  </Group>
                )}

                {/* Current Period - only show for paid plans with billing periods */}
                {!isFreePlan &&
                  subscription.currentPeriodStart &&
                  subscription.currentPeriodEnd && (
                    <>
                      <Group justify="space-between">
                        <Text fw={500}>Current Period</Text>
                        <Text size="sm">
                          {formatDate(subscription.currentPeriodStart)} -{" "}
                          {formatDate(subscription.currentPeriodEnd)}
                        </Text>
                      </Group>
                    </>
                  )}

                {/* Trial Information */}
                {subscription.status === "ACTIVE_TRIALING" &&
                  subscription.trialEndsAt && (
                    <Alert color="blue" icon={<IconInfoCircle size={16} />}>
                      Your trial ends on {formatDate(subscription.trialEndsAt)}
                    </Alert>
                  )}

                {/* Cancellation Notice */}
                {subscription.cancelAtPeriodEnd && (
                  <Alert color="yellow" icon={<IconInfoCircle size={16} />}>
                    Your subscription will cancel at the end of the current
                    billing period ({formatDate(subscription.currentPeriodEnd)})
                  </Alert>
                )}
              </Stack>
            </Stack>
            <div className="h-[1px] w-full bg-[#D6D6D6]"></div>
            <Group
              justify="space-between"
              px={{ base: 16, md: 32 }}
              pb={16}
              pt={16}
            >
              <div>
                {isFreePlan ? (
                  <Text size="sm" c="dimmed">
                    Upgrade to Pro to access billing management
                  </Text>
                ) : (
                  <Text size="sm" c="dimmed">
                    Manage your subscription, payment methods, and billing
                    history
                  </Text>
                )}
              </div>

              {!isFreePlan && (
                <Button
                  variant="default"
                  leftSection={<IconCreditCard size={16} />}
                  onClick={handleManageSubscription}
                  loading={actionLoading}
                >
                  Manage Billing
                </Button>
              )}
            </Group>
          </Stack>
        </Card>
      </Grid.Col>
    </Grid>
  );
};

export default BillingSection;
