import { VerifiedSession, withAuth } from "@/lib/auth/withAuth";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import prisma from "@/lib/prisma";
import {
  BillingInterval,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  session: VerifiedSession
) {
  if (req.method !== "GET") {
    return res
      .status(HttpStatus.MethodNotAllowed)
      .json({ error: "Method not allowed" });
  }

  try {
    let subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        plan: true,
        status: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        billingInterval: true,
        trialEndsAt: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    // If no subscription exists, create a default FREE subscription
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.ACTIVE,
          billingInterval: BillingInterval.MONTHLY,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now for FREE plans
        },
        select: {
          id: true,
          plan: true,
          status: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
          billingInterval: true,
          trialEndsAt: true,
          stripeCustomerId: true,
          stripeSubscriptionId: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
        },
      });
    }

    // Convert dates to ISO strings for JSON serialization
    const formattedSubscription = {
      ...subscription,
      currentPeriodStart:
        subscription.currentPeriodStart?.toISOString() || null,
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() || null,
      trialEndsAt: subscription.trialEndsAt?.toISOString() || null,
      createdAt: subscription.createdAt?.toISOString(),
      updatedAt: subscription.updatedAt?.toISOString(),
    };

    return res.status(HttpStatus.Ok).json(formattedSubscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return res
      .status(HttpStatus.InternalServerError)
      .json({ error: "Failed to fetch subscription" });
  }
});
