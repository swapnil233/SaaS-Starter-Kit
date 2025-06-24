import { BillingInterval, SubscriptionPlan } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useState } from "react";

interface UpgradeSubscriptionParams {
  plan: SubscriptionPlan;
  billingInterval: BillingInterval;
  enableTrial?: boolean;
}

// API functions for upgrading and managing subscriptions
const upgradeSubscription = async ({
  plan,
  billingInterval,
  enableTrial,
}: UpgradeSubscriptionParams): Promise<{ url: string }> => {
  const response = await fetch(`/api/users/me/subscription/upgrade`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ plan, billingInterval, enableTrial }),
  });

  if (!response.ok) {
    throw new Error("Failed to upgrade subscription");
  }

  return response.json();
};

const manageSubscription = async (): Promise<{
  url?: string;
  redirect?: string;
}> => {
  const response = await fetch(`/api/users/me/subscription/manage`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed to manage subscription");
  }

  return response.json();
};

export const useSubscriptionUpgrade = (setError: (_error: string) => void) => {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);

  // Upgrade subscription mutation
  const upgradeMutation = useMutation({
    mutationFn: upgradeSubscription,
    onSuccess: (data) => {
      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        // Reset loading states if we don't redirect
        setLoadingPlan(null);
        setActionLoading(false);
        throw new Error("No checkout URL returned");
      }
    },
    onError: (err) => {
      console.error("Error upgrading subscription:", err);
      setError("Failed to upgrade subscription. Please try again.");
      setLoadingPlan(null);
      setActionLoading(false);
    },
  });

  // Manage subscription mutation
  const manageMutation = useMutation({
    mutationFn: manageSubscription,
    onSuccess: (data) => {
      if (data.url) {
        // Redirect to Stripe Customer Portal
        window.location.href = data.url;
      } else if (data.redirect) {
        // If not on paid plan, redirect to upgrade
        router.push(data.redirect);
      } else {
        // Reset loading state if we don't redirect
        setActionLoading(false);
        throw new Error("No portal URL returned");
      }
    },
    onError: (err) => {
      console.error("Error managing subscription:", err);
      setError("Failed to access subscription management. Please try again.");
      setActionLoading(false);
    },
  });

  // Function to handle plan upgrades
  const handleUpgrade = async (
    plan: SubscriptionPlan,
    billingInterval: BillingInterval,
    enableTrial?: boolean
  ) => {
    // Prevent duplicate calls if already loading
    if (loadingPlan || actionLoading) return;

    try {
      setLoadingPlan(plan);
      setActionLoading(true);
      setError("");

      // Log the action being taken
      console.log(`Upgrading to ${plan} plan`);

      // Use the mutation to handle the upgrade
      upgradeMutation.mutate({
        plan,
        billingInterval,
        enableTrial,
      });
    } catch (err) {
      setLoadingPlan(null);
      setActionLoading(false);
      console.error("Error upgrading subscription:", err);
      setError("Failed to initiate subscription upgrade. Please try again.");
    }
  };

  // Handler to manage existing subscription
  const handleManageSubscription = async () => {
    // Prevent duplicate calls if already loading
    if (loadingPlan || actionLoading) return;

    try {
      setActionLoading(true);
      setError("");

      manageMutation.mutate();
    } catch (err) {
      setActionLoading(false);
    }
  };

  return {
    actionLoading,
    loadingPlan,
    setLoadingPlan,
    setActionLoading,
    handleUpgrade,
    handleManageSubscription,
  };
};
