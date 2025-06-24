import prisma from "@/lib/prisma";
import { getStripeClient } from "@/lib/subscriptions/stripeClient";
import {
  BillingInterval,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";
import Stripe from "stripe";
import {
  sendSubscriptionCancellationEmail,
  sendSubscriptionDowngradeEmail,
  sendSubscriptionUpgradeEmail,
} from "./email/subscription.email.service";

// Helper function to get Stripe client safely (server-side only)
const getStripe = () => {
  if (typeof window !== "undefined") {
    throw new Error(
      "Stripe operations should only be performed on the server-side"
    );
  }
  return getStripeClient();
};

// Price IDs - sourced from environment variables
export const SUBSCRIPTION_PRICES = {
  PRO: {
    MONTHLY: process.env.STRIPE_PRO_PRICE_ID_MONTHLY || "",
    YEARLY: process.env.STRIPE_PRO_PRICE_ID_YEARLY || "",
  },
};

// Map Stripe status to our status
const statusMap = {
  active: SubscriptionStatus.ACTIVE,
  past_due: SubscriptionStatus.PAST_DUE,
  unpaid: SubscriptionStatus.UNPAID,
  canceled: SubscriptionStatus.CANCELED,
  incomplete: SubscriptionStatus.INCOMPLETE,
  incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED,
  trialing: SubscriptionStatus.ACTIVE_TRIALING,
  paused: SubscriptionStatus.PAST_DUE, // Map paused to past_due for simplicity
  all: SubscriptionStatus.ACTIVE, // For when all subscriptions are retrieved
  ended: SubscriptionStatus.CANCELED, // For ended subscriptions
  created: SubscriptionStatus.INCOMPLETE, // Initial creation state
  pending: SubscriptionStatus.INCOMPLETE, // Pending payment or verification
  trial_expired: SubscriptionStatus.PAST_DUE, // Trial has expired
  payment_failed: SubscriptionStatus.PAST_DUE, // Payment attempt failed
} as const;

// Helper to determine plan from price ID
export async function getPlanFromPriceId(
  priceId: string
): Promise<SubscriptionPlan> {
  // First check against our known price IDs
  for (const [plan, intervals] of Object.entries(SUBSCRIPTION_PRICES)) {
    for (const intervalPriceId of Object.values(intervals)) {
      if (intervalPriceId === priceId) {
        return plan as keyof typeof SUBSCRIPTION_PRICES;
      }
    }
  }

  // If not found in our mapping, check the price metadata
  try {
    // Only call getStripeClient on server-side
    if (typeof window !== "undefined") {
      return SubscriptionPlan.PRO; // Default for client-side
    }
    const stripe = getStripe();
    const price = await stripe.prices.retrieve(priceId);

    if (
      price.metadata?.plan &&
      [SubscriptionPlan.FREE, SubscriptionPlan.PRO].includes(
        price.metadata.plan as SubscriptionPlan
      )
    ) {
      return price.metadata.plan as SubscriptionPlan;
    }
  } catch (error) {
    console.error(`Error retrieving price information for ${priceId}:`, error);
  }

  // Default to PRO if we can't determine
  return SubscriptionPlan.PRO;
}

// Verify webhook signature with timestamp validation
export function verifyStripeWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  // Only call getStripeClient on server-side
  if (typeof window !== "undefined") {
    throw new Error(
      "Webhook verification should only be performed on the server-side"
    );
  }
  const stripe = getStripe();

  // The constructEvent method validates the signature and throws if invalid
  // It also checks the timestamp to prevent replay attacks
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export const saveSubscriptionSelection = async ({
  plan,
  billingInterval,
}: {
  plan: string;
  billingInterval: string;
}): Promise<{ redirectUrl: string }> => {
  const response = await fetch("/api/public/subscription-selection", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ plan, billingInterval }),
  });

  if (!response.ok) {
    throw new Error("Failed to save subscription selection");
  }

  return response.json();
};

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  try {
    // Only process subscription checkout sessions
    if (session.mode !== "subscription") {
      return;
    }

    // Get the Stripe subscription ID
    const stripeSubscriptionId = session.subscription as string;
    if (!stripeSubscriptionId) {
      console.error("No subscription ID in checkout session");
      return;
    }

    // Get user ID from session metadata
    const userId = session.metadata?.userId;
    if (!userId) {
      console.error("No user ID in checkout session metadata");
      return;
    }

    // Execute in a transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Fetch the subscription details from Stripe
      const stripe = getStripe();
      const subscription =
        await stripe.subscriptions.retrieve(stripeSubscriptionId);

      // Use centralized service to determine the plan from price ID
      const priceId = subscription.items.data[0].price.id;
      const plan = await getPlanFromPriceId(priceId);

      console.log(`Determined plan: ${plan} from price: ${priceId}`);

      // Update our subscription record with the Stripe subscription ID, status, and plan
      await tx.subscription.update({
        where: { userId },
        data: {
          stripeSubscriptionId,
          status:
            subscription.status === "trialing"
              ? SubscriptionStatus.ACTIVE_TRIALING
              : SubscriptionStatus.ACTIVE,
          plan: plan as SubscriptionPlan,
          currentPeriodStart: new Date(
            subscription.current_period_start * 1000
          ),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          priceId,
        },
      });

      // Mark user as having used their trial if this was a trial checkout
      const isTrialInitiated = session.metadata?.isTrialInitiated === "true";
      if (isTrialInitiated && plan === SubscriptionPlan.PRO) {
        await tx.user.update({
          where: { id: userId },
          data: { hasUsedTrial: true },
        });
        console.log(
          `Marked user ${userId} as having used trial after successful checkout completion`
        );
      }

      console.log(
        `Updated subscription for user ${userId} with Stripe subscription ${stripeSubscriptionId} and plan ${plan}`
      );
    });
  } catch (error) {
    console.error("Error processing checkout.session.completed:", error);
    throw error; // Re-throw to allow webhook handler to respond appropriately
  }
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  try {
    console.log(`Processing subscription update for: ${subscription.id}`);

    // Find the subscription in our database
    const dbSubscription = await prisma.subscription.findFirst({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      include: {
        user: true,
      },
    });

    if (!dbSubscription) {
      console.error(`Subscription not found in database: ${subscription.id}`);
      return;
    }

    // Store the values before updating the database
    const previousPlan = dbSubscription.plan as SubscriptionPlan;
    const previousCancelState = dbSubscription.cancelAtPeriodEnd;

    // Use type assertion to handle the status type
    const newStatus = statusMap[subscription.status] as SubscriptionStatus;

    // Determine the plan based on the price ID
    const stripe = getStripe();

    let plan = dbSubscription.plan as SubscriptionPlan;

    // Only update plan if the subscription is active and has items
    if (
      subscription.status === "active" &&
      subscription.items.data.length > 0
    ) {
      try {
        const price = await stripe.prices.retrieve(
          subscription.items.data[0].price.id
        );

        // First check if plan is stored in price metadata
        if (price.metadata && price.metadata.plan) {
          plan = price.metadata.plan as SubscriptionPlan;
        } else {
          // Fallback logic to match price ID to plan
          const priceId = price.id;
          if (
            priceId === process.env.STRIPE_PRO_PRICE_ID_MONTHLY ||
            priceId === process.env.STRIPE_PRO_PRICE_ID_YEARLY
          ) {
            plan = SubscriptionPlan.PRO;
          }
        }
      } catch (priceError) {
        console.error("Error retrieving price information:", priceError);
      }
    }

    // Compare BEFORE updating the database
    const planChanged = plan !== previousPlan;
    const cancellationChanged =
      subscription.cancel_at_period_end !== previousCancelState;

    console.log(`Subscription ${subscription.id} update details:
      - Previous Plan: ${previousPlan}, New Plan: ${plan}, Plan Changed: ${planChanged}
      - Previous Cancel State: ${previousCancelState}, New Cancel State: ${subscription.cancel_at_period_end}, Cancellation Changed: ${cancellationChanged}
    `);

    // Update our subscription record with plan information
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: newStatus,
        plan: plan as SubscriptionPlan,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        priceId: subscription.items.data[0]?.price.id,
      },
    });

    console.log(
      `Updated database subscription: ${dbSubscription.id} with cancelAtPeriodEnd: ${subscription.cancel_at_period_end}`
    );

    // Send email notification if there are significant changes
    if (dbSubscription.user && dbSubscription.user.email) {
      if (planChanged || cancellationChanged) {
        console.log(
          `Preparing to send email notification for subscription change`
        );
        await notifySubscriptionChange({
          subscription,
          dbSubscription,
          previousPlan,
          plan,
        });
      } else {
        console.log(
          `No significant subscription changes detected to trigger email notification.`
        );
      }
    } else {
      console.log(
        `No user email found for subscription ${dbSubscription.id}, skipping email notification.`
      );
    }
  } catch (error) {
    console.error("Error updating subscription:", error);
  }
}

/**
 * Centralized function to send subscription change notifications
 */
async function notifySubscriptionChange({
  subscription,
  dbSubscription,
  previousPlan,
  plan,
}: {
  subscription: Stripe.Subscription;
  dbSubscription: any;
  previousPlan: string;
  plan: string;
}) {
  try {
    const stripe = getStripe();

    if (!dbSubscription.user || !dbSubscription.user.email) {
      console.log("No user found to notify");
      return;
    }

    console.log(
      `Preparing to send subscription change email to: ${dbSubscription.user.email}`
    );

    // Try to get invoice information, but don't fail if not available
    let invoiceUrl: string | undefined = undefined;
    let totalPrice: number | undefined = undefined;

    try {
      if (subscription.latest_invoice) {
        const invoiceId =
          typeof subscription.latest_invoice === "string"
            ? subscription.latest_invoice
            : subscription.latest_invoice.id;

        const invoice = await stripe.invoices.retrieve(invoiceId);
        console.log(`Retrieved invoice ${invoiceId} for notification`);

        invoiceUrl = invoice.hosted_invoice_url || undefined;
        totalPrice = invoice.amount_paid
          ? invoice.amount_paid / 100
          : undefined;
      }
    } catch (error) {
      console.log(`Could not retrieve invoice details: ${error}`);
      // Continue with email even if invoice fetch fails
    }

    // Determine billing interval
    const billingInterval =
      subscription.items.data.length > 0 &&
      subscription.items.data[0].price.recurring?.interval === "year"
        ? BillingInterval.YEARLY
        : BillingInterval.MONTHLY;

    // Format effective date
    const effectiveDate = new Date(
      subscription.current_period_start * 1000
    ).toLocaleDateString();

    // Check if this is an upgrade, downgrade, or cancellation
    const isPlanUpgrade =
      previousPlan === SubscriptionPlan.FREE && plan === SubscriptionPlan.PRO;

    // Cancellation at period end
    const isCancel = subscription.cancel_at_period_end;

    // Determine the overall change type
    let changeType = "none";

    if (isCancel) {
      changeType = "cancellation";
    } else if (isPlanUpgrade) {
      changeType = "upgrade";
    } else if (plan !== previousPlan) {
      changeType = "downgrade";
    }

    console.log(
      `Change type determined as: ${changeType}. Plan upgrade: ${isPlanUpgrade}`
    );

    // Send appropriate email
    if (changeType === "upgrade") {
      await sendSubscriptionUpgradeEmail({
        userEmail: dbSubscription.user.email,
        previousPlan: previousPlan as SubscriptionPlan,
        newPlan: plan as SubscriptionPlan,
        billingInterval,
        totalPrice,
        effectiveDate,
        invoiceUrl,
      });
    } else if (changeType === "cancellation") {
      const accessEndDate = new Date(
        subscription.current_period_end * 1000
      ).toLocaleDateString();

      await sendSubscriptionCancellationEmail({
        userEmail: dbSubscription.user.email,
        currentPlan: plan as SubscriptionPlan,
        billingInterval,
        accessEndDate,
      });
    } else if (changeType === "downgrade") {
      await sendSubscriptionDowngradeEmail({
        userEmail: dbSubscription.user.email,
        previousPlan: previousPlan as SubscriptionPlan,
        newPlan: plan as SubscriptionPlan,
        billingInterval,
        totalPrice,
        effectiveDate,
        invoiceUrl,
      });
    }

    console.log(
      `Successfully sent subscription ${changeType} email to ${dbSubscription.user.email}`
    );
  } catch (emailError) {
    console.error("Error in notifySubscriptionChange:", emailError);
  }
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  try {
    console.log(`Processing subscription deletion for: ${subscription.id}`);

    // Find the subscription in our database
    const dbSubscription = await prisma.subscription.findFirst({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      include: {
        user: true,
      },
    });

    if (!dbSubscription) {
      console.error(`Subscription not found in database: ${subscription.id}`);
      return;
    }

    console.log(
      `Found subscription ${dbSubscription.id} for user ${dbSubscription.user?.email || "unknown"}`
    );

    // Update our subscription record - mark as canceled but don't delete
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: SubscriptionStatus.CANCELED,
        cancelAtPeriodEnd: true,
      },
    });

    console.log(`Updated subscription ${dbSubscription.id} status to CANCELED`);

    // Send cancellation notification email
    if (dbSubscription.user && dbSubscription.user.email) {
      console.log(`Preparing to send cancellation notification email`);

      try {
        // Format the access end date (current_period_end) properly
        const accessEndDate = new Date(
          subscription.current_period_end * 1000
        ).toLocaleDateString();

        // Determine billing interval
        let billingInterval: BillingInterval = BillingInterval.MONTHLY;
        try {
          // Try to get billing interval from Stripe subscription
          billingInterval =
            subscription.items.data.length > 0 &&
            subscription.items.data[0].price.recurring?.interval === "year"
              ? BillingInterval.YEARLY
              : BillingInterval.MONTHLY;
        } catch (error) {
          console.error("Error determining billing interval:", error);
        }

        await sendSubscriptionCancellationEmail({
          userEmail: dbSubscription.user.email,
          currentPlan: dbSubscription.plan as SubscriptionPlan,
          billingInterval,
          accessEndDate,
        });

        console.log(
          `Successfully sent subscription cancellation email to ${dbSubscription.user.email}`
        );
      } catch (emailError) {
        console.error(
          "Error sending subscription cancellation email:",
          emailError
        );
      }
    } else {
      console.log(
        `No user email found to notify about subscription cancellation`
      );
    }
  } catch (error) {
    console.error("Error processing subscription deletion:", error);
  }
}

/**
 * Handle invoice payment succeeded - also sends notifications for subscription updates
 */
export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    // Only process subscription invoices
    if (!invoice.subscription) {
      return;
    }

    console.log(
      `Processing invoice payment succeeded: ${invoice.id}, billing reason: ${invoice.billing_reason}`
    );

    // Find the subscription in our database
    const dbSubscription = await prisma.subscription.findFirst({
      where: {
        stripeSubscriptionId: invoice.subscription as string,
      },
      include: {
        user: true,
      },
    });

    if (!dbSubscription) {
      console.error(`Subscription not found for invoice: ${invoice.id}`);
      return;
    }

    // Record the invoice
    await prisma.subscriptionInvoice.create({
      data: {
        stripeInvoiceId: invoice.id,
        amount: invoice.amount_paid,
        status: invoice.status || "paid",
        invoiceUrl: invoice.hosted_invoice_url || "",
        pdfUrl: invoice.invoice_pdf || "",
        invoiceDate: new Date(invoice.created * 1000),
        dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
        subscriptionId: dbSubscription.id,
      },
    });

    // If this is for a newly created subscription or a subscription change, update its status and plan
    if (
      dbSubscription.status === SubscriptionStatus.INCOMPLETE ||
      invoice.billing_reason === "subscription_create" ||
      invoice.billing_reason === "subscription_update"
    ) {
      const stripe = getStripe();

      // Get the subscription to determine plan and status
      const stripeSubscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string,
        { expand: ["items"] }
      );

      let plan = dbSubscription.plan as SubscriptionPlan;
      // Determine the plan from the price ID
      if (stripeSubscription.items.data.length > 0) {
        try {
          const price = await stripe.prices.retrieve(
            stripeSubscription.items.data[0].price.id
          );

          // First check if plan is stored in price metadata
          if (price.metadata && price.metadata.plan) {
            plan = price.metadata.plan as SubscriptionPlan;
          } else {
            // Fallback logic to match price ID to plan
            const priceId = price.id;
            if (
              priceId === process.env.STRIPE_PRO_PRICE_ID_MONTHLY ||
              priceId === process.env.STRIPE_PRO_PRICE_ID_YEARLY
            ) {
              plan = SubscriptionPlan.PRO;
            }
          }

          console.log(
            `Invoice payment succeeded: Determined plan ${plan} from price ${stripeSubscription.items.data[0].price.id}`
          );
        } catch (priceError) {
          console.error("Error retrieving price information:", priceError);
        }
      }

      // Check if the subscription is in trial
      const isTrialing = stripeSubscription.status === "trialing";
      const newStatus = isTrialing
        ? SubscriptionStatus.ACTIVE_TRIALING
        : SubscriptionStatus.ACTIVE;

      console.log(
        `Setting subscription status to ${newStatus} (Stripe status: ${stripeSubscription.status})`
      );

      await prisma.subscription.update({
        where: { id: dbSubscription.id },
        data: {
          status: newStatus,
          plan: plan as SubscriptionPlan,
        },
      });

      console.log(
        `Updated subscription ${dbSubscription.id} status to ${newStatus} and plan to ${plan}`
      );
    }
  } catch (error) {
    console.error("Error processing invoice payment success:", error);
  }
}

export async function handleCustomerDeleted(customer: Stripe.Customer) {
  try {
    // Find subscriptions associated with this Stripe customer
    const subscriptions = await prisma.subscription.findMany({
      where: {
        stripeCustomerId: customer.id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (subscriptions.length === 0) {
      console.log(`No subscriptions found for customer: ${customer.id}`);
      return;
    }

    // Update all subscriptions for this customer to be canceled
    await prisma.subscription.updateMany({
      where: {
        stripeCustomerId: customer.id,
      },
      data: {
        status: SubscriptionStatus.CANCELED,
        cancelAtPeriodEnd: true,
        stripeCustomerId: null, // Remove the link to the deleted customer
        stripePaymentMethodId: null, // Clear payment method as well
      },
    });

    // Log detailed information about affected users
    const affectedUsers = subscriptions.map((sub) => ({
      userId: sub.user.id,
      userEmail: sub.user.email,
      subscriptionId: sub.id,
    }));

    console.log(
      `Customer ${customer.id} deleted. Affected users:`,
      JSON.stringify(affectedUsers)
    );
    console.log(
      `Marked ${subscriptions.length} subscriptions as canceled for ${affectedUsers.length} users`
    );
  } catch (error) {
    console.error("Error processing customer deletion:", error);
  }
}

// Check if a user is eligible for a trial
export async function checkTrialEligibility(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { hasUsedTrial: true },
    });

    return !user?.hasUsedTrial;
  } catch (error) {
    console.error("Error checking trial eligibility:", error);
    return false; // Default to not eligible on error
  }
}
