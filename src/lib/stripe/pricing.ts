export interface PricingPlan {
  title: string;
  description: string;
  price: number;
  features: string[];
  isPopular?: boolean;
  priceId: string;
  purchaseLink: string;
}

export interface PricingPlans {
  monthly: PricingPlan[];
  yearly: PricingPlan[];
  oneTime: PricingPlan[];
}

export const pricingPlans: PricingPlans = {
  monthly: [
    {
      title: "Starter",
      description:
        "Ideal for small teams and startups to manage their clients.",
      price: 19.99,
      features: [
        "50,000 requests per month",
        "50 GB storage",
        "50,000 API requests per month",
        "Advanced features",
        "Premium support",
        "API access",
        "Advanced analytics",
        "Data export",
        "Custom integrations",
        "Priority processing",
      ],
      isPopular: true,
      priceId: "price_1PRqpGKG4eoKdRb1qhGzmAv1",
      purchaseLink: "https://buy.stripe.com/test_dR68zo0jkgwwa3e7sv",
    },
  ],
  yearly: [
    {
      title: "Starter",
      description:
        "Ideal for small teams and startups to manage their clients.",
      price: 200,
      features: [
        "50,000 requests per month",
        "50 GB storage",
        "50,000 API requests per month",
        "Advanced features",
        "Premium support",
        "API access",
        "Advanced analytics",
        "Data export",
        "Custom integrations",
        "Priority processing",
      ],
      isPopular: true,
      priceId: "price_1PRr2OKG4eoKdRb1irefuQek",
      purchaseLink: "https://buy.stripe.com/test_8wM02S6HI800ejubIM",
    },
  ],
  oneTime: [
    {
      title: "One-Time Purchase Plan",
      description: "A single purchase plan for lifetime access.",
      price: 2000,
      features: [
        "Unlimited contacts",
        "Lifetime reporting and analytics",
        "Lifetime premium support",
        "Unlimited storage",
        "All future updates included",
      ],
      priceId: "price_1PRrUkKG4eoKdRb1wT9jpsy0",
      purchaseLink: "https://buy.stripe.com/test_4gwg1QaXY1BC4IU4go",
    },
  ],
};
