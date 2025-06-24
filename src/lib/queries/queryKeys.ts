/*
 * Query key catalog for @tanstack/react-query.
 * Use these helpers instead of raw string arrays for better autocomplete and type safety.
 * This is kinda like a factory pattern for query keys.
 */

import type { QueryKey } from "@tanstack/react-query";

/**
 * Functions return typed tuples that can be used as QueryKeys.
 */
export const queryKeys = {
  // Auth / user
  user: {
    profile: (): QueryKey => ["user"],
    subscription: (): QueryKey => ["user", "subscription"],
    trialEligibility: (): QueryKey => ["user", "trial-eligibility"],
  },
  profilePicture: (key: string | null): QueryKey => ["profilePictureUrl", key],

  // reCAPTCHA verification
  recaptcha: {
    verify: (): QueryKey => ["recaptcha", "verify"],
  },

  // Dashboard overview
  dashboard: (): QueryKey => ["dashboard"],
};

export type QueryKeys = typeof queryKeys;
