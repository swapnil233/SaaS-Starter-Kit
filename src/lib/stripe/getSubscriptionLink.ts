import { SessionContextValue } from "next-auth/react";

export const getSubscriptionLink = (
  session: SessionContextValue,
  purchaseLink: string
): string => {
  if (session.status === "authenticated") {
    return `${purchaseLink}?prefilled_email=${session.data?.user.email}`;
  } else if (
    session.status === "unauthenticated" ||
    session.status === "loading"
  ) {
    return `/dashboard/plans`;
  }

  return "";
};
