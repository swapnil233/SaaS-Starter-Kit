import { createSubjects } from "@/lib/emails/domains";

import { FROM_ADDRESSES } from "@/lib/emails/domains";
import { sendEmail } from "@/lib/emails/sendEmail";
import SubscriptionCancelledEmail from "@/lib/emails/SubscriptionCancelledEmail";
import SubscriptionChangedEmail from "@/lib/emails/SubscriptionChangedEmail";
import { host } from "@/lib/host";
import { BillingInterval, SubscriptionPlan } from "@prisma/client";
import { render } from "@react-email/render";

/**
 * Send a subscription changed email (for upgrades and downgrades)
 */
export const sendSubscriptionChangedEmail = async (params: {
  userEmail: string;
  isUpgrade: boolean;
  previousPlan: SubscriptionPlan;
  newPlan: SubscriptionPlan;
  billingInterval: BillingInterval;
  totalPrice?: number;
  effectiveDate: string;
  invoiceUrl?: string;
  customMessage?: string;
}): Promise<void> => {
  const {
    userEmail,
    isUpgrade,
    previousPlan,
    newPlan,
    billingInterval,
    totalPrice,
    effectiveDate,
    invoiceUrl,
    customMessage,
  } = params;
  try {
    const dashboardLink = `${host}/dashboard`;

    const html = render(
      SubscriptionChangedEmail({
        isUpgrade,
        previousPlan,
        newPlan,
        billingInterval,
        totalPrice,
        effectiveDate,
        dashboardLink,
        invoiceUrl,
        customMessage,
      })
    );

    await sendEmail({
      to: userEmail,
      from: FROM_ADDRESSES.notifications,
      subject: createSubjects.subscriptionChanged("", isUpgrade),
      html,
    });

    console.log(`Subscription change email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending subscription change email:", error);
    throw error;
  }
};

/**
 * Send a subscription upgrade email
 */
export const sendSubscriptionUpgradeEmail = async (params: {
  userEmail: string;
  previousPlan: SubscriptionPlan;
  newPlan: SubscriptionPlan;
  billingInterval: BillingInterval;
  totalPrice?: number;
  effectiveDate: string;
  invoiceUrl?: string;
}): Promise<void> => {
  const {
    userEmail,
    previousPlan,
    newPlan,
    billingInterval,
    totalPrice,
    effectiveDate,
    invoiceUrl,
  } = params;
  try {
    // Use the existing function with isUpgrade = true
    await sendSubscriptionChangedEmail({
      userEmail,
      isUpgrade: true,
      previousPlan,
      newPlan,
      billingInterval,
      totalPrice,
      effectiveDate,
      invoiceUrl,
    });

    console.log(`Subscription upgrade email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending subscription upgrade email:", error);
    throw error;
  }
};

/**
 * Send a subscription downgrade email
 */
export const sendSubscriptionDowngradeEmail = async (params: {
  userEmail: string;
  previousPlan: SubscriptionPlan;
  newPlan: SubscriptionPlan;
  billingInterval: BillingInterval;
  totalPrice?: number;
  effectiveDate: string;
  invoiceUrl?: string;
}): Promise<void> => {
  const {
    userEmail,
    previousPlan,
    newPlan,
    billingInterval,
    totalPrice,
    effectiveDate,
    invoiceUrl,
  } = params;
  try {
    // Use the existing function with isUpgrade = false
    await sendSubscriptionChangedEmail({
      userEmail,
      isUpgrade: false,
      previousPlan,
      newPlan,
      billingInterval,
      totalPrice,
      effectiveDate,
      invoiceUrl,
    });

    console.log(`Subscription downgrade email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending subscription downgrade email:", error);
    throw error;
  }
};

/**
 * Send a subscription cancellation email
 */
export const sendSubscriptionCancellationEmail = async (params: {
  userEmail: string;
  currentPlan: SubscriptionPlan;
  billingInterval: BillingInterval;
  accessEndDate: string; // This will be the current_period_end from the Stripe subscription
}): Promise<void> => {
  const { userEmail, currentPlan, billingInterval, accessEndDate } = params;
  try {
    const dashboardLink = `${host}/dashboard`;

    // If you have a separate template for cancellations, use it here
    // For now, we'll adapt the existing template
    const html = render(
      SubscriptionCancelledEmail({
        currentPlan,
        billingInterval,
        accessEndDate,
        dashboardLink,
      })
    );

    await sendEmail({
      to: userEmail,
      from: FROM_ADDRESSES.notifications,
      subject: `Your subscription has been cancelled`,
      html,
    });

    console.log(`Subscription cancellation email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending subscription cancellation email:", error);
    throw error;
  }
};
