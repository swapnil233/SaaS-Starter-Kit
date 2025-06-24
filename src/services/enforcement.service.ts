import prisma from "@/lib/prisma";
import { SubscriptionPlan } from "@prisma/client";

/**
 * Result of an enforcement check
 */
export interface EnforcementResult {
  allowed: boolean;
  message?: string;
  currentUsage?: number;
  limit?: number;
}

/**
 * Get the subscription plan for a user
 * Only returns the plan if the subscription is ACTIVE, otherwise defaults to FREE
 */
export async function getUserPlan(userId: string): Promise<SubscriptionPlan> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    // Only use the plan if subscription exists and is ACTIVE or TRIALING, otherwise default to FREE
    return subscription?.status === "ACTIVE" ||
      subscription?.status === "ACTIVE_TRIALING"
      ? subscription.plan
      : SubscriptionPlan.FREE;
  } catch (error) {
    console.error("Error getting user plan:", error);
    return SubscriptionPlan.FREE;
  }
}
