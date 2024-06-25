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
      price: 29,
      features: [
        "Up to 100 contacts",
        "Basic reporting and analytics",
        "Email support",
        "1 GB storage",
        "Customizable dashboard",
      ],
      priceId: "price_1PRXaZKG4eoKdRb1OEodBEF8",
      purchaseLink: "https://buy.stripe.com/test_cN2eXMeaa0xy0sEeUV",
    },
    {
      title: "Professional",
      description:
        "Perfect for growing businesses needing advanced CRM features.",
      price: 99,
      features: [
        "Up to 1,000 contacts",
        "Advanced reporting and analytics",
        "Priority email support",
        "10 GB storage",
        "Integration with third-party apps",
      ],
      isPopular: true,
      priceId: "price_1PRqpGKG4eoKdRb1qhGzmAv1",
      purchaseLink: "https://buy.stripe.com/test_dR68zo0jkgwwa3e7sv",
    },
    {
      title: "Enterprise",
      description: "Best for large enterprises with extensive CRM needs.",
      price: 150,
      features: [
        "Unlimited contacts",
        "Custom reporting and analytics",
        "Dedicated account manager",
        "Unlimited storage",
        "Enterprise-grade security",
      ],
      priceId: "price_1PRr82KG4eoKdRb1jB0hGknx",
      purchaseLink: "https://buy.stripe.com/test_eVa4j89TU0xy2AM28d",
    },
  ],
  yearly: [
    {
      title: "Starter",
      description:
        "Ideal for small teams and startups to manage their clients.",
      price: 290,
      features: [
        "Up to 100 contacts",
        "Basic reporting and analytics",
        "Email support",
        "1 GB storage",
        "Customizable dashboard",
      ],
      priceId: "price_1PRXcJKG4eoKdRb1bsSfi5YF",
      purchaseLink: "https://buy.stripe.com/test_7sI02S7LMfss4IUfZ0",
    },
    {
      title: "Professional",
      description:
        "Perfect for growing businesses needing advanced CRM features.",
      price: 990,
      features: [
        "Up to 1000 contacts",
        "Advanced reporting and analytics",
        "Priority email support",
        "10 GB storage",
        "Integration with third-party apps",
      ],
      isPopular: true,
      priceId: "price_1PRr2OKG4eoKdRb1irefuQek",
      purchaseLink: "https://buy.stripe.com/test_8wM02S6HI800ejubIM",
    },
    {
      title: "Enterprise",
      description: "Best for large enterprises with extensive CRM needs.",
      price: 1500,
      features: [
        "Unlimited contacts",
        "Custom reporting and analytics",
        "Dedicated account manager",
        "Unlimited storage",
        "Enterprise-grade security",
      ],
      priceId: "price_1PRr82KG4eoKdRb1jB0hGknx",
      purchaseLink: "https://buy.stripe.com/test_dR69Ds2rsdkk4IU7sy",
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
