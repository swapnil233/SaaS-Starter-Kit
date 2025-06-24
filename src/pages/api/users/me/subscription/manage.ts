import { VerifiedSession, withAuth } from "@/lib/auth/withAuth";
import { HttpStatus } from "@/lib/constants/HttpStatus";
import { host } from "@/lib/host";
import prisma from "@/lib/prisma";
import { createBillingPortalSession } from "@/lib/subscriptions/stripe";
import { SubscriptionPlan } from "@prisma/client";
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

  try {
    // Get user subscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: true,
        stripeCustomer: true,
      },
    });

    if (!user) {
      return res.status(HttpStatus.NotFound).json({ error: "User not found" });
    }

    if (!user.subscription) {
      return res
        .status(HttpStatus.NotFound)
        .json({ error: "Subscription not found" });
    }

    const subscription = user.subscription;

    // If user is on FREE plan, redirect to upgrade page
    if (subscription.plan === SubscriptionPlan.FREE) {
      return res.status(HttpStatus.Ok).json({
        redirect: "/dashboard", // or wherever your upgrade page is
      });
    }

    // For paid plans, check if we have a Stripe customer ID
    const stripeCustomerId =
      user.stripeCustomer?.stripeCustomerId || subscription.stripeCustomerId;

    if (!stripeCustomerId) {
      return res.status(HttpStatus.BadRequest).json({
        error: "No Stripe customer found",
        message: "Unable to access billing portal without a Stripe customer",
      });
    }

    try {
      // Create billing portal session
      const portalSession = await createBillingPortalSession({
        customerId: stripeCustomerId,
        returnUrl: `${host}/dashboard`,
      });

      if (!portalSession || !portalSession.url) {
        throw new Error("Failed to create billing portal session");
      }

      return res.status(HttpStatus.Ok).json({
        url: portalSession.url,
      });
    } catch (portalError) {
      console.error("Error creating billing portal session:", portalError);
      return res.status(HttpStatus.InternalServerError).json({
        error: "Failed to create billing portal session",
        details:
          portalError instanceof Error ? portalError.message : "Unknown error",
      });
    }
  } catch (error) {
    console.error("Error managing subscription:", error);
    return res.status(HttpStatus.InternalServerError).json({
      error: "Failed to process subscription management request",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
