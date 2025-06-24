import {
  handleCheckoutSessionCompleted,
  handleCustomerDeleted,
  handleInvoicePaymentSucceeded,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
  verifyStripeWebhookSignature,
} from "@/services/stripe.service";
import { buffer } from "micro";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

// Disable body parsing, need the raw body for Stripe webhook verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res
      .status(500)
      .json({ error: "Stripe environment variables not configured" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res
      .status(500)
      .json({ error: "Stripe webhook secret not configured" });
  }

  try {
    // Get the raw body from the request
    const rawBody = await buffer(req);
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }

    // Use our centralized service to verify the event with timestamp validation
    const event = verifyStripeWebhookSignature(
      rawBody,
      signature,
      webhookSecret
    );

    // Generate a unique idempotency key from the event ID
    const idempotencyKey = `webhook_${event.id}`;

    // Handle the event based on its type
    await handleStripeEvent(event, idempotencyKey);

    // Return a 200 success response to acknowledge receipt of the event
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);

    // Don't expose detailed error messages in the response
    return res.status(400).json({ error: "Webhook validation failed" });
  }
}

async function handleStripeEvent(event: Stripe.Event, idempotencyKey: string) {
  console.log(
    `Processing webhook event: ${event.type} with idempotency key: ${idempotencyKey}`
  );

  try {
    switch (event.type) {
      // Checkout session events
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      // Subscription lifecycle events
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      // Invoice payment events
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(
          event.data.object as Stripe.Invoice
        );
        break;

      // Customer events
      case "customer.deleted":
        await handleCustomerDeleted(event.data.object as Stripe.Customer);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error handling webhook event ${event.type}:`, error);
    throw error; // Re-throw to let the main handler catch and respond
  }
}
