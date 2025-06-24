import { BillingInterval, SubscriptionPlan } from "@prisma/client";

export interface SubscriptionIntent {
  plan: SubscriptionPlan;
  billingInterval: BillingInterval;
  timestamp: number;
}

// Key for storing subscription intent in localStorage and URL params
export const SUBSCRIPTION_INTENT_KEY = "subscription_intent";
export const UPGRADE_MODAL_PARAM = "upgrade";

/**
 * Save subscription intent to localStorage
 */
export function saveSubscriptionIntent(intent: SubscriptionIntent): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SUBSCRIPTION_INTENT_KEY, JSON.stringify(intent));
    } catch (error) {
      console.warn(
        "Failed to save subscription intent to localStorage:",
        error
      );
    }
  }
}

/**
 * Get subscription intent from localStorage
 */
export function getSubscriptionIntent(): SubscriptionIntent | null {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(SUBSCRIPTION_INTENT_KEY);
      if (stored) {
        const intent = JSON.parse(stored) as SubscriptionIntent;
        // Check if intent is not too old (24 hours)
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        if (Date.now() - intent.timestamp < maxAge) {
          return intent;
        } else {
          // Clean up old intent
          clearSubscriptionIntent();
        }
      }
    } catch (error) {
      console.warn(
        "Failed to retrieve subscription intent from localStorage:",
        error
      );
    }
  }
  return null;
}

/**
 * Clear subscription intent from localStorage
 */
export function clearSubscriptionIntent(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(SUBSCRIPTION_INTENT_KEY);
    } catch (error) {
      console.warn(
        "Failed to clear subscription intent from localStorage:",
        error
      );
    }
  }
}

/**
 * Create a URL with subscription intent parameters
 */
export function createSubscriptionIntentUrl(
  baseUrl: string,
  intent: SubscriptionIntent
): string {
  const url = new URL(baseUrl, window.location.origin);
  url.searchParams.set("plan", intent.plan);
  url.searchParams.set("interval", intent.billingInterval);
  url.searchParams.set(UPGRADE_MODAL_PARAM, "true");
  return url.toString();
}

/**
 * Parse subscription intent from URL parameters
 */
export function parseSubscriptionIntentFromUrl(
  url: string | URL
): SubscriptionIntent | null {
  try {
    const urlObj = typeof url === "string" ? new URL(url) : url;
    const plan = urlObj.searchParams.get("plan") as SubscriptionPlan;
    const billingInterval = urlObj.searchParams.get(
      "interval"
    ) as BillingInterval;
    const upgradeParam = urlObj.searchParams.get(UPGRADE_MODAL_PARAM);

    if (plan && billingInterval && upgradeParam === "true") {
      // Validate plan and billing interval
      if (
        Object.values(SubscriptionPlan).includes(plan) &&
        Object.values(BillingInterval).includes(billingInterval)
      ) {
        return {
          plan,
          billingInterval,
          timestamp: Date.now(),
        };
      }
    }
  } catch (error) {
    console.warn("Failed to parse subscription intent from URL:", error);
  }
  return null;
}

/**
 * Check if URL has upgrade modal parameter
 */
export function shouldShowUpgradeModal(searchParams: URLSearchParams): boolean {
  return searchParams.get(UPGRADE_MODAL_PARAM) === "true";
}

/**
 * Remove upgrade modal parameter from URL without navigation
 */
export function cleanupUpgradeModalParam(): void {
  if (typeof window !== "undefined" && window.history) {
    const url = new URL(window.location.href);
    if (url.searchParams.has(UPGRADE_MODAL_PARAM)) {
      url.searchParams.delete(UPGRADE_MODAL_PARAM);
      url.searchParams.delete("plan");
      url.searchParams.delete("interval");
      window.history.replaceState({}, "", url.toString());
    }
  }
}

/**
 * Encode subscription intent for email verification token
 */
export function encodeSubscriptionIntentForToken(
  intent: SubscriptionIntent
): string {
  return btoa(JSON.stringify(intent));
}

/**
 * Decode subscription intent from email verification token
 */
export function decodeSubscriptionIntentFromToken(
  encoded: string
): SubscriptionIntent | null {
  try {
    const decoded = atob(encoded);
    const intent = JSON.parse(decoded) as SubscriptionIntent;

    // Validate the decoded intent
    if (
      intent.plan &&
      intent.billingInterval &&
      Object.values(SubscriptionPlan).includes(intent.plan) &&
      Object.values(BillingInterval).includes(intent.billingInterval)
    ) {
      return intent;
    }
  } catch (error) {
    console.warn("Failed to decode subscription intent from token:", error);
  }
  return null;
}

/**
 * Get banner dismissal state from localStorage
 */
export function getProBannerDismissed(): boolean {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem("pro_banner_dismissed") === "true";
    } catch (error) {
      console.warn("Failed to get pro banner dismissal state:", error);
    }
  }
  return false;
}

/**
 * Set banner dismissal state in localStorage
 */
export function setProBannerDismissed(dismissed: boolean): void {
  if (typeof window !== "undefined") {
    try {
      if (dismissed) {
        localStorage.setItem("pro_banner_dismissed", "true");
      } else {
        localStorage.removeItem("pro_banner_dismissed");
      }
    } catch (error) {
      console.warn("Failed to set pro banner dismissal state:", error);
    }
  }
}
