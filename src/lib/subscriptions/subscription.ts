import prisma from "@/lib/prisma";
import { SUBSCRIPTION_PRICES } from "@/services/stripe.service";
import {
  BillingInterval,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";
import { host } from "../host";
import {
  cancelSubscription,
  changeSubscriptionPlan,
  createCheckoutSession,
  createStripeCustomer,
  createSubscription as createStripeSubscription,
} from "./stripe";

// Create a subscription for a user
export async function createUserSubscription({
  userId,
  plan = SubscriptionPlan.FREE,
  billingInterval = BillingInterval.MONTHLY,
  enableTrial = false,
}: {
  userId: string;
  plan?: SubscriptionPlan;
  billingInterval?: BillingInterval;
  enableTrial?: boolean;
}) {
  try {
    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        stripeCustomer: true,
        subscription: true,
      },
    });

    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    if (!user.email) {
      throw new Error(`User ${userId} does not have an email address`);
    }

    // Check if user already has a subscription
    if (user.subscription) {
      console.log(
        `Subscription already exists for user ${userId}. Returning existing subscription.`
      );
      return { subscription: user.subscription, redirectUrl: null };
    }

    // Use a transaction with serializable isolation level to prevent race conditions
    return await prisma.$transaction(
      async (tx) => {
        // Check trial eligibility if trial is requested
        if (enableTrial && plan === SubscriptionPlan.PRO) {
          if (user.hasUsedTrial) {
            throw new Error(
              "User has already used their trial. Trial is only available once per user."
            );
          }

          // Mark user as having used their trial
          await tx.user.update({
            where: { id: userId },
            data: { hasUsedTrial: true },
          });
        }

        // Free plan doesn't need Stripe integration
        if (plan === SubscriptionPlan.FREE) {
          // Create free subscription record directly - no billing periods for FREE plan
          const subscription = await tx.subscription.create({
            data: {
              plan: plan as SubscriptionPlan,
              status: SubscriptionStatus.ACTIVE,
              userId,
              billingInterval: billingInterval as BillingInterval,
              // FREE plans don't have billing periods, so we don't set currentPeriodStart/End
            },
          });

          return { subscription, redirectUrl: null };
        }

        // For paid plans, get or create Stripe customer
        let customerId: string;

        // Prioritize existing stripe customer relationship
        if (user.stripeCustomer?.stripeCustomerId) {
          // Reuse existing customer ID from user relationship
          customerId = user.stripeCustomer.stripeCustomerId;
          console.log(`Using existing Stripe customer: ${customerId}`);
        } else {
          // Create new Stripe customer
          try {
            const stripeCustomer = await createStripeCustomer({
              email: user.email,
              name: user.name,
              userId: user.id,
            });
            if (!stripeCustomer || !stripeCustomer.id) {
              throw new Error("Failed to create Stripe customer");
            }
            customerId = stripeCustomer.id;

            // Save customer ID relation to user
            await tx.stripeCustomer.create({
              data: {
                stripeCustomerId: customerId,
                userId: user.id,
              },
            });

            console.log(`Created new Stripe customer: ${customerId}`);
          } catch (error) {
            console.error("Error creating Stripe customer:", error);
            throw new Error(
              `Failed to create Stripe customer: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
          }
        }

        // Determine Stripe price ID based on plan
        let priceId = null;
        const isPaidPlan = (plan as SubscriptionPlan) !== SubscriptionPlan.FREE;
        if (isPaidPlan) {
          priceId =
            SUBSCRIPTION_PRICES[plan as keyof typeof SUBSCRIPTION_PRICES][
              billingInterval
            ];
        }

        // Create incomplete subscription record
        const subscription = await tx.subscription.create({
          data: {
            plan: plan as SubscriptionPlan,
            status: SubscriptionStatus.INCOMPLETE,
            stripeCustomerId: customerId,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            priceId: priceId,
            userId,
            billingInterval: billingInterval as BillingInterval,
          },
        });

        // Create a checkout session instead of directly creating a subscription
        if (priceId) {
          const successUrl = `${host}/dashboard?success=true`;
          const cancelUrl = `${host}/dashboard?canceled=true`;

          console.log(`Creating checkout session for plan ${plan}`);

          const checkoutSession = await createCheckoutSession({
            customerId,
            priceId,
            successUrl,
            cancelUrl,
            metadata: {
              userId,
              subscriptionId: subscription.id,
              isTrialInitiated: enableTrial ? "true" : "false",
            },
            trialPeriodDays:
              enableTrial && plan === SubscriptionPlan.PRO ? 14 : undefined,
          });

          if (checkoutSession && checkoutSession.url) {
            return { subscription, redirectUrl: checkoutSession.url };
          } else {
            throw new Error("Failed to create checkout session");
          }
        }

        return { subscription, redirectUrl: null };
      },
      {
        isolationLevel: "Serializable", // Prevent race conditions
      }
    );
  } catch (error) {
    console.error(`Error in createUserSubscription:`, error);
    throw error;
  }
}

// Change subscription plan
export async function changeUserSubscriptionPlan({
  userId,
  newPlan,
}: {
  userId: string;
  newPlan: SubscriptionPlan;
}) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
    },
  });

  if (!user || !user.subscription) {
    throw new Error("User or subscription not found");
  }

  const subscription = user.subscription;
  const currentPlan = subscription.plan as SubscriptionPlan;
  const billingInterval = (subscription.billingInterval ||
    BillingInterval.MONTHLY) as BillingInterval;

  // If current plan is FREE, and new plan is paid
  if (
    currentPlan === SubscriptionPlan.FREE &&
    newPlan !== SubscriptionPlan.FREE
  ) {
    // Need to create a new Stripe subscription
    if (!user.email) {
      throw new Error("User email is required for paid plans");
    }

    // Create Stripe customer if it doesn't exist
    const customerId =
      subscription.stripeCustomerId ||
      (
        await createStripeCustomer({
          email: user.email,
          name: user.name,
          userId: user.id,
        })
      ).id;

    // Create new Stripe subscription
    const priceId =
      SUBSCRIPTION_PRICES[newPlan as keyof typeof SUBSCRIPTION_PRICES][
        billingInterval
      ];
    const stripeSubscription = await createStripeSubscription({
      customerId,
      priceId,
    });

    // Update local subscription
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        plan: newPlan as SubscriptionPlan,
        status: SubscriptionStatus.INCOMPLETE, // Will be updated via webhook
        stripeCustomerId: customerId,
        stripeSubscriptionId: stripeSubscription?.id,
        currentPeriodStart: stripeSubscription?.current_period_start
          ? new Date(stripeSubscription.current_period_start * 1000)
          : subscription.currentPeriodStart,
        currentPeriodEnd: stripeSubscription?.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000)
          : subscription.currentPeriodEnd,
        priceId,
      },
    });
  }
  // If current plan is paid and new plan is FREE
  else if (
    currentPlan !== SubscriptionPlan.FREE &&
    newPlan === SubscriptionPlan.FREE
  ) {
    // Cancel Stripe subscription if it exists
    if (subscription.stripeSubscriptionId) {
      await cancelSubscription(subscription.stripeSubscriptionId);
    }

    // Update local subscription to FREE
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        stripeSubscriptionId: null,
        currentPeriodStart: null, // Clear billing periods for FREE plan
        currentPeriodEnd: null, // Clear billing periods for FREE plan
        priceId: null,
      },
    });
  }
  // If changing between paid plans
  else if (
    currentPlan !== SubscriptionPlan.FREE &&
    newPlan !== SubscriptionPlan.FREE
  ) {
    if (!subscription.stripeSubscriptionId) {
      throw new Error("Stripe subscription not found");
    }

    // Change plan in Stripe
    const newPriceId =
      SUBSCRIPTION_PRICES[newPlan as keyof typeof SUBSCRIPTION_PRICES][
        billingInterval
      ];
    if (!newPriceId) {
      throw new Error("Invalid new plan");
    }
    await changeSubscriptionPlan(subscription.stripeSubscriptionId, newPriceId);

    // Update local subscription
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        plan: newPlan as SubscriptionPlan,
        priceId: newPriceId,
      },
    });
  }

  return true;
}

// Helper to get a user's plan
async function getUserPlan(userId: string): Promise<SubscriptionPlan> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    // Only use the plan if subscription exists and is ACTIVE, otherwise default to FREE
    return subscription?.status === "ACTIVE"
      ? subscription.plan
      : SubscriptionPlan.FREE;
  } catch (error) {
    console.error("Error getting user plan:", error);
    return SubscriptionPlan.FREE;
  }
}

// Cancel user subscription
export async function cancelUserSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
    },
  });

  if (!user || !user.subscription) {
    throw new Error("User or subscription not found");
  }

  const subscription = user.subscription;

  // Cancel in Stripe if needed
  if (
    subscription.stripeSubscriptionId &&
    subscription.plan !== SubscriptionPlan.FREE
  ) {
    await cancelSubscription(subscription.stripeSubscriptionId);
  }

  // Update status locally
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: SubscriptionStatus.CANCELED,
      cancelAtPeriodEnd: true,
    },
  });

  return true;
}

// Get user subscription details
export async function getUserSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    include: {
      user: true,
    },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  return subscription;
}
