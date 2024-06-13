interface Plan {
  link: string;
  priceId: string;
  price: number;
  duration: "/month" | "/year";
}

export const plans: Plan[] = [
  {
    link: process.env.NODE_ENV === "development" ? "" : "",
    priceId: process.env.NODE_ENV === "development" ? "" : "",
    price: 19,
    duration: "/month",
  },
];
