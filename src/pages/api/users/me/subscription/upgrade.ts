import { VerifiedSession, withAuth } from "@/lib/auth/withAuth";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import { host } from "@/lib/host";
import prisma from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/subscriptions/stripe";
import { getStripeClient } from "@/lib/subscriptions/stripeClient";
import { SUBSCRIPTION_PRICES } from "@/services/stripe.service";
import { BillingInterval, SubscriptionPlan } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  session: VerifiedSession
) {
  if (req.method !== "POST") {
    return res
      .status(HttpStatus.MethodNotAllowed)
      .json({ error: "Method not allowed" });
  }

  // Validate request parameters
  const {
    plan,
    billingInterval = BillingInterval.MONTHLY,
    enableTrial = false,
  } = req.body;

  // Validate plan type
  if (!plan || ![SubscriptionPlan.FREE, SubscriptionPlan.PRO].includes(plan)) {
    return res.status(HttpStatus.BadRequest).json({
      error: "Invalid plan type",
      message: "Plan must be one of FREE or PRO",
    });
  }

  // Validate billing interval
  if (
    ![BillingInterval.MONTHLY, BillingInterval.YEARLY].includes(billingInterval)
  ) {
    return res.status(HttpStatus.BadRequest).json({
      error: "Invalid billing interval",
      message: "Billing interval must be MONTHLY or YEARLY",
    });
  }

  try {
    // Get user with subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      return res.status(HttpStatus.NotFound).json({ error: "User not found" });
    }

    if (!user.email) {
      return res
        .status(HttpStatus.BadRequest)
        .json({ error: "User must have an email address" });
    }

    // Start database transaction
    return await prisma.$transaction(
      async (tx) => {
        // Get or create subscription record
        const subscription =
          user.subscription ||
          (await tx.subscription.create({
            data: {
              plan: SubscriptionPlan.FREE,
              status: "ACTIVE",
              userId: session.user.id,
              billingInterval: BillingInterval.MONTHLY,
            },
          }));

        // Determine the price ID based on plan and billing interval
        const validPlan = plan as SubscriptionPlan;
        const validBillingInterval = billingInterval as BillingInterval;

        // Skip FREE plan as it doesn't have price IDs
        const priceId =
          validPlan !== SubscriptionPlan.FREE
            ? SUBSCRIPTION_PRICES[
                validPlan as Exclude<
                  SubscriptionPlan,
                  typeof SubscriptionPlan.FREE
                >
              ][validBillingInterval]
            : undefined;

        if (!priceId) {
          return res.status(HttpStatus.BadRequest).json({
            error: `No price ID configured for ${validPlan} plan with ${validBillingInterval} billing interval`,
          });
        }

        // Create or validate Stripe customer
        let customerId = subscription.stripeCustomerId;

        // Treat 'none' as if no customer ID exists
        if (!customerId || customerId === "none") {
          // Create customer in Stripe
          try {
            const stripeClient = getStripeClient();
            const customer = await stripeClient.customers.create({
              email: user.email,
              name: user.name || user.email.split("@")[0],
              metadata: {
                userId: user.id,
              },
            });

            customerId = customer.id;

            // Create or update StripeCustomer record
            await tx.stripeCustomer.upsert({
              where: { userId: user.id },
              update: { stripeCustomerId: customerId },
              create: {
                userId: user.id,
                stripeCustomerId: customerId,
              },
            });

            // Update subscription with customer ID
            await tx.subscription.update({
              where: { id: subscription.id },
              data: {
                stripeCustomerId: customerId,
              },
            });
          } catch (stripeError) {
            console.error("Stripe customer creation error:", stripeError);
            return res.status(HttpStatus.InternalServerError).json({
              error: "Failed to create Stripe customer",
              details:
                stripeError instanceof Error
                  ? stripeError.message
                  : "Unknown error",
            });
          }
        }

        // Check trial eligibility if trial is requested
        if (enableTrial && validPlan === SubscriptionPlan.PRO) {
          if (user.hasUsedTrial) {
            return res.status(HttpStatus.BadRequest).json({
              error: "Trial not available",
              message:
                "You have already used your trial. Trial is only available once per user.",
            });
          }
        }

        // ENFORCE MANDATORY TRIAL: If user is on FREE plan and upgrading to PRO,
        // and user hasn't used trial, force trial regardless of enableTrial parameter
        let finalEnableTrial = enableTrial;
        if (validPlan === SubscriptionPlan.PRO) {
          const currentPlan = subscription.plan;
          const isUpgradingFromFree = currentPlan === SubscriptionPlan.FREE;
          const userEligibleForTrial = !user.hasUsedTrial;

          if (isUpgradingFromFree && userEligibleForTrial) {
            finalEnableTrial = true; // Force trial for first-time Pro users
            console.log(
              `Forcing trial for user ${user.id} upgrading from FREE to PRO (first-time trial user)`
            );
          } else if (enableTrial && user.hasUsedTrial) {
            return res.status(HttpStatus.BadRequest).json({
              error: "Trial not available",
              message:
                "You have already used your trial. Trial is only available once per user.",
            });
          }
        }

        try {
          const checkoutSession = await createCheckoutSession({
            customerId,
            priceId,
            successUrl: `${host}/dashboard?success=true`,
            cancelUrl: `${host}/dashboard?canceled=true`,
            metadata: {
              subscriptionId: subscription.id,
              // Add trial information to metadata for webhook processing
              isTrialInitiated: finalEnableTrial ? "true" : "false",
              userId: user.id,
            },
            trialPeriodDays:
              finalEnableTrial && validPlan === SubscriptionPlan.PRO
                ? 14
                : undefined,
          });

          if (!checkoutSession || !checkoutSession.url) {
            throw new Error("Failed to create checkout session");
          }

          // NOTE: Removed User.hasUsedTrial update - this will be handled in webhook
          // after successful checkout completion

          // Update subscription with billing interval
          await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              billingInterval: billingInterval as any,
            },
          });

          // Return the checkout URL
          return res.status(HttpStatus.Ok).json({ url: checkoutSession.url });
        } catch (checkoutError) {
          console.error("Error creating checkout session:", checkoutError);
          return res.status(HttpStatus.InternalServerError).json({
            error: "Failed to create checkout session",
            details:
              checkoutError instanceof Error
                ? checkoutError.message
                : "Unknown error",
          });
        }
      },
      {
        // Transaction options to ensure consistency
        maxWait: 5000, // 5 seconds max wait time
        timeout: 10000, // 10 seconds timeout
      }
    );
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    return res.status(HttpStatus.InternalServerError).json({
      error: "Failed to process subscription upgrade request",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
