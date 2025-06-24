import { getStripeClient } from "./stripeClient";

// Lazy initialization - only create stripe client when needed (server-side only)
const getStripe = () => {
  if (typeof window !== "undefined") {
    throw new Error(
      "Stripe secret operations should only be performed on the server-side"
    );
  }
  return getStripeClient();
};

// Create a Stripe customer for a user
export async function createStripeCustomer({
  email,
  name,
  userId,
}: {
  email: string;
  name: string;
  userId: string;
}) {
  try {
    const stripe = getStripe();
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });
    return customer;
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw error;
  }
}

// Create a subscription for a user
export async function createSubscription({
  customerId,
  priceId,
}: {
  customerId: string;
  priceId?: string; // Optional for free tier
}) {
  try {
    // For free tier, we don't create an actual Stripe subscription
    if (!priceId) {
      return null;
    }

    const stripe = getStripe();
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [
        {
          price: priceId,
          quantity: 1, // Always 1 for user-based subscriptions
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
        payment_method_types: ["card"],
      },
      expand: ["latest_invoice.payment_intent"],
    });

    return subscription;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
}

// Note: Quantity updates not needed for user-based subscriptions
// as each user always has quantity = 1

// Change subscription plan
export async function changeSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
) {
  try {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const itemId = subscription.items.data[0].id;

    await stripe.subscriptionItems.update(itemId, {
      price: newPriceId,
    });

    return true;
  } catch (error) {
    console.error("Error changing subscription plan:", error);
    throw error;
  }
}

// Cancel a subscription
export async function cancelSubscription(subscriptionId: string) {
  try {
    const stripe = getStripe();
    await stripe.subscriptions.cancel(subscriptionId);
    return true;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
}

// Create a checkout session for subscription
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  metadata = {},
  trialPeriodDays,
}: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  trialPeriodDays?: number;
}) {
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1, // Always 1 for user-based subscriptions
        },
      ],
      mode: "subscription",
      subscription_data: trialPeriodDays
        ? { trial_period_days: trialPeriodDays }
        : undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

// Create a billing portal session
export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  try {
    const stripe = getStripe();
    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return portalSession;
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    throw error;
  }
}
