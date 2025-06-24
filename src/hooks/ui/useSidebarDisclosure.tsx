import { useSubscription } from "@/hooks/subscription/useSubscription";
import { getProBannerDismissed } from "@/lib/subscriptions/subscription-intent";
import { SubscriptionPlan } from "@prisma/client";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";

export const useSidebarDisclosure = () => {
  const [
    mobileSidebarWasExpanded,
    { toggle: toggleMobileSidebar, close: closeMobileSidebar },
  ] = useDisclosure();
  const [sidebarWasExpanded, { toggle: toggleSidebar }] = useDisclosure(true);
  const [showProBanner, setShowProBanner] = useState<boolean | null>(null);
  const { subscription } = useSubscription();

  // Determine if we should show the Pro banner
  useEffect(() => {
    if (subscription) {
      const isFreePlan = subscription.plan === SubscriptionPlan.FREE;
      const isDismissed = getProBannerDismissed();

      // Show banner if user is on free plan and hasn't dismissed it
      setShowProBanner(isFreePlan && !isDismissed);
    } else {
      // If no subscription data yet, don't show banner
      setShowProBanner(false);
    }
  }, [subscription]);

  const expandMobileSidebar = () => {
    toggleMobileSidebar();
  };

  const handleCollapseClick = () => {
    toggleSidebar();
    closeMobileSidebar();

    if (showProBanner) {
      setShowProBanner(false);
    }
  };

  return {
    mobileSidebarWasExpanded,
    expandMobileSidebar,
    sidebarWasExpanded,
    handleCollapseClick,
    closeMobileSidebar,
    showProBanner,
    setShowProBanner,
  };
};
