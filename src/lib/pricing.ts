export interface PricingPlan {
  title: string;
  description: string;
  price?: number;
  oneTimePurchase?: boolean;
  features: string[];
  isPopular?: boolean;
}

export const getPricingPlans = (isYearly: boolean): PricingPlan[] => {
  return [
    {
      title: "Starter",
      description:
        "Best option for personal use and for your next side projects.",
      price: isYearly ? 290 : 29,
      features: [
        "Individual configuration",
        "No setup, monthly, or hidden fees",
        "Team size: 1 developer",
        "Premium support: 6 months",
        "Free updates: 6 months",
      ],
    },
    {
      title: "Professional",
      description: "Relevant for multiple users, extended & premium support.",
      price: isYearly ? 990 : 99,
      features: [
        "Individual configuration",
        "No setup, monthly, or hidden fees",
        "Team size: 10 developers",
        "Premium support: 24 months",
        "Free updates: 24 months",
      ],
      isPopular: true,
    },
    {
      title: "Enterprise",
      description:
        "Best for large scale uses and extended redistribution rights.",
      price: isYearly ? 1500 : 150,
      features: [
        "Individual configuration",
        "No setup, monthly, or hidden fees",
        "Team size: 100+ developers",
        "Premium support: 36 months",
        "Free updates: 36 months",
      ],
    },
    {
      title: "Free Plan",
      description: "A basic plan that is free forever.",
      features: ["Individual configuration", "Team size: 1 developer"],
    },
    {
      title: "One-Time Purchase Plan",
      description: "A single purchase plan.",
      oneTimePurchase: true,
      price: 2000,
      features: [
        "Individual configuration",
        "No setup, monthly, or hidden fees",
        "Team size: Unlimited",
        "Premium support: Lifetime",
        "Free updates: Lifetime",
      ],
    },
  ];
};
