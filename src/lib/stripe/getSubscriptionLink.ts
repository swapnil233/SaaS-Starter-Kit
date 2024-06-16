import { SessionContextValue } from "next-auth/react";

export const getSubscriptionLink = (
  session: SessionContextValue,
  purchaseLink: string
): string => {
  if (session.status === "authenticated") {
    return `${purchaseLink}?prefilled_email=${session.data?.user.email}`;
  } else if (session.status === "unauthenticated") {
    return `/signin?callbackUrl=${encodeURIComponent(purchaseLink)}`;
  } else if (session.status === "loading") {
    return "/";
  }

  return "";
};
