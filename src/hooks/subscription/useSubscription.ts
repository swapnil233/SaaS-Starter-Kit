import { queryKeys } from "@/lib/queries/queryKeys";
import {
  BillingInterval,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";
import {
  QueryObserverResult,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export interface SubscriptionData {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  billingInterval: BillingInterval;
  userId: string;

  // Optional fields that might be useful
  createdAt?: string;
  updatedAt?: string;
  trialEndsAt?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

const fetchSubscription = async (): Promise<SubscriptionData> => {
  const response = await fetch(`/api/users/me/subscription`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
        `Failed to fetch subscription data (${response.status})`
    );
  }

  const data = await response.json();
  return data;
};

// This hook is used to fetch the subscription data for the current user.
export const useSubscription = (onError?: (_errorMessage: string) => void) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [billingInterval, setBillingInterval] = useState<BillingInterval>(
    BillingInterval.MONTHLY
  );

  // Fetch subscription data with React Query
  const {
    data: subscription,
    isLoading,
    error: queryError,
    refetch,
  }: QueryObserverResult<SubscriptionData, Error> = useQuery({
    queryKey: queryKeys.user.subscription(),
    queryFn: async () => {
      try {
        const data = await fetchSubscription();
        return data;
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        if (error instanceof Error) {
          throw new Error(`Subscription fetch failed: ${error.message}`);
        }
        throw error;
      }
    },
    retry: 1, // Only retry once to avoid infinite loops
  });

  // Set billing interval from subscription if available
  useEffect(() => {
    if (subscription?.billingInterval) {
      setBillingInterval(subscription.billingInterval as BillingInterval);
    }
  }, [subscription]);

  // Handle query error
  useEffect(() => {
    if (queryError) {
      console.error("Error fetching subscription:", queryError);
      const errorMessage =
        "Failed to load subscription information. You can try again by clicking the retry button below.";
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [queryError, onError]);

  // Process success query param
  useEffect(() => {
    if (router.query.success === "true") {
      setSuccess("Your subscription has been updated successfully!");

      // Refresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.subscription(),
      });

      // Clear the query params
      router.replace(`/dashboard`, undefined, {
        shallow: true,
      });
    }

    if (router.query.canceled === "true") {
      // Clear the query params
      router.replace(`/dashboard`, undefined, {
        shallow: true,
      });
    }
  }, [router.query.success, router.query.canceled, router, queryClient]);

  return {
    subscription,
    isLoading,
    error,
    setError,
    success,
    setSuccess,
    billingInterval,
    setBillingInterval,
    refetch,
  };
};
