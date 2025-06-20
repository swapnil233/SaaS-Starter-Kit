import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

export const useSidebarDisclosure = () => {
  const [
    mobileSidebarWasExpanded,
    { toggle: toggleMobileSidebar, close: closeMobileSidebar },
  ] = useDisclosure();
  const [sidebarWasExpanded, { toggle: toggleSidebar }] = useDisclosure(true);
  const [showProBanner, setShowProBanner] = useState<boolean>(true);

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
