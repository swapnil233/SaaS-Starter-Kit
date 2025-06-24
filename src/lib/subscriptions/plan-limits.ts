import { SUBSCRIPTION_PRICES } from "@/services/stripe.service";
import { BillingInterval, SubscriptionPlan } from "@prisma/client";

/**
 * Generic feature flags that can be enabled/disabled per plan
 * Customize these for your specific application needs
 */
export type FeatureFlag =
  | "advanced_features"
  | "premium_support"
  | "api_access"
  | "advanced_analytics"
  | "data_export"
  | "custom_integrations"
  | "priority_processing"
  | "white_labeling";

/**
 * Type to ensure all plans have the same structure
 */
export type PlanLimits = {
  // Generic usage limits
  monthlyRequests: number;
  storageGB: number;
  // Feature access
  enabledFeatures: FeatureFlag[];
  // API limits
  apiRequestsPerMonth: number;
  // Support level
  supportLevel: "community" | "email" | "priority";
};

/**
 * Pricing information for marketing/UI purposes
 */
export type PlanPricing = {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyPriceId?: string;
  yearlyPriceId?: string;
  isPopular?: boolean;
  features: string[];
};

/**
 * Central configuration for all plan-specific limits
 *
 * This is designed for a user-based SaaS where individual users subscribe
 * to different tiers of service. Customize the limits and features for your application.
 */
export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  [SubscriptionPlan.FREE]: {
    // Basic limits
    monthlyRequests: 1000,
    storageGB: 1,

    // API limits
    apiRequestsPerMonth: 100,

    // Support
    supportLevel: "community",

    // Feature flags
    enabledFeatures: [] as FeatureFlag[],
  },

  [SubscriptionPlan.PRO]: {
    // Increased limits
    monthlyRequests: 50000,
    storageGB: 50,

    // API limits
    apiRequestsPerMonth: 50000,

    // Support
    supportLevel: "priority",

    // Feature flags
    enabledFeatures: [
      "advanced_features",
      "premium_support",
      "api_access",
      "advanced_analytics",
      "data_export",
      "custom_integrations",
      "priority_processing",
    ] as FeatureFlag[],
  },
};

/**
 * Helper to get limits for a specific plan
 */
export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  return PLAN_LIMITS[plan];
}

/**
 * Check if a feature is enabled for a specific plan
 */
export function isFeatureEnabled(
  plan: SubscriptionPlan,
  feature: FeatureFlag
): boolean {
  return PLAN_LIMITS[plan].enabledFeatures.includes(feature);
}

/**
 * Complete plan configuration including pricing and features
 * This is the SINGLE SOURCE OF TRUTH for all plan information
 */
export const PLAN_CONFIG: Record<SubscriptionPlan, PlanPricing> = {
  [SubscriptionPlan.FREE]: {
    name: "Free",
    description: "Perfect for getting started with basic features",
    monthlyPrice: 0,
    yearlyPrice: 0,
    isPopular: false,
    features: [
      "1,000 requests per month",
      "1 GB storage",
      "100 API requests per month",
      "Community support",
      "Basic dashboard",
    ],
  },
  [SubscriptionPlan.PRO]: {
    name: "Pro",
    description: "Ideal for growing businesses and power users",
    monthlyPrice: 19.99,
    yearlyPrice: 200,
    monthlyPriceId: SUBSCRIPTION_PRICES.PRO?.MONTHLY,
    yearlyPriceId: SUBSCRIPTION_PRICES.PRO?.YEARLY,
    isPopular: true,
    features: [
      "50,000 requests per month",
      "50 GB storage",
      "50,000 API requests per month",
      "All advanced features",
      "Premium support",
      "API access",
      "Advanced analytics",
      "Data export",
      "Custom integrations",
      "Priority processing",
      "14-day free trial",
    ],
  },
};

/**
 * Get plan configuration including pricing and features
 */
export function getPlanConfig(plan: SubscriptionPlan): PlanPricing {
  return PLAN_CONFIG[plan];
}

/**
 * Get price for a specific plan and billing interval
 */
export function getPlanPrice(
  plan: SubscriptionPlan,
  interval: BillingInterval
): number {
  const config = getPlanConfig(plan);
  return interval === BillingInterval.YEARLY
    ? config.yearlyPrice
    : config.monthlyPrice;
}

/**
 * Get Stripe price ID for a specific plan and billing interval
 */
export function getPlanPriceId(
  plan: SubscriptionPlan,
  interval: BillingInterval
): string | undefined {
  const config = getPlanConfig(plan);
  return interval === BillingInterval.YEARLY
    ? config.yearlyPriceId
    : config.monthlyPriceId;
}

/**
 * Get all plans formatted for marketing/pricing components
 */
export function getAllPlansForMarketing(): {
  plan: SubscriptionPlan;
  config: PlanPricing;
  limits: PlanLimits;
}[] {
  return Object.values(SubscriptionPlan).map((plan) => ({
    plan,
    config: getPlanConfig(plan),
    limits: getPlanLimits(plan),
  }));
}

/**
 * Generate marketing-friendly feature summaries for each plan
 * This creates the simple feature lists used in pricing cards
 */
export function getPlanFeatureSummary(plan: SubscriptionPlan): string[] {
  const limits = getPlanLimits(plan);
  const features: string[] = [];

  // Monthly requests
  if (limits.monthlyRequests === Infinity) {
    features.push("Unlimited requests");
  } else {
    features.push(
      `${limits.monthlyRequests.toLocaleString()} requests per month`
    );
  }

  // Storage
  if (limits.storageGB === Infinity) {
    features.push("Unlimited storage");
  } else {
    features.push(`${limits.storageGB} GB storage`);
  }

  // API access
  if (isFeatureEnabled(plan, "api_access")) {
    if (limits.apiRequestsPerMonth === Infinity) {
      features.push("Unlimited API access");
    } else {
      features.push(
        `${limits.apiRequestsPerMonth.toLocaleString()} API requests per month`
      );
    }
  }

  // Advanced features
  if (isFeatureEnabled(plan, "advanced_features")) {
    features.push("Advanced features");
  }

  if (isFeatureEnabled(plan, "advanced_analytics")) {
    features.push("Advanced analytics");
  }

  if (isFeatureEnabled(plan, "data_export")) {
    features.push("Data export");
  }

  if (isFeatureEnabled(plan, "custom_integrations")) {
    features.push("Custom integrations");
  }

  if (isFeatureEnabled(plan, "priority_processing")) {
    features.push("Priority processing");
  }

  if (isFeatureEnabled(plan, "white_labeling")) {
    features.push("White-label options");
  }

  // Support level
  switch (limits.supportLevel) {
    case "community":
      features.push("Community support");
      break;
    case "email":
      features.push("Email support");
      break;
    case "priority":
      features.push("Priority support");
      break;
  }

  return features;
}
