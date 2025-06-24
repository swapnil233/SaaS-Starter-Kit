import ProBanner from "@/components/billing/pro-banner";
import { AppShell, ScrollArea, Stack } from "@mantine/core";
import { Dispatch, FC, SetStateAction } from "react";
import CollapseButton from "./CollapseButton";
import NavList from "./NavList";

interface SidebarProps {
  sidebarWasExpanded: boolean;
  handleCollapseClick: () => void;
  closeMobileSidebar: () => void;
  showProBanner: boolean | null;
  setShowProBanner: Dispatch<SetStateAction<boolean | null>>;
}

const Sidebar: FC<SidebarProps> = ({
  sidebarWasExpanded,
  handleCollapseClick,
  closeMobileSidebar,
  showProBanner,
  setShowProBanner,
}) => {
  return (
    <AppShell.Navbar
      w={{ base: 300, sm: sidebarWasExpanded ? 250 : 80 }}
      style={{ zIndex: 200 }}
    >
      <AppShell.Section px="md" pt="md" pb={0} grow component={ScrollArea}>
        <Stack>
          <NavList
            isCollapsed={!sidebarWasExpanded}
            closeMobileSidebarNav={closeMobileSidebar}
          />
        </Stack>
      </AppShell.Section>

      {/* Pro Banner Section - only show if expanded and banner should be shown */}
      {sidebarWasExpanded && showProBanner && (
        <AppShell.Section px="md" py="xs">
          <ProBanner setShowProBanner={setShowProBanner} />
        </AppShell.Section>
      )}

      <AppShell.Section px="md" py={"xs"} visibleFrom="sm">
        <CollapseButton
          sidebarWasExpanded={sidebarWasExpanded}
          handleCollapseClick={handleCollapseClick}
        />
      </AppShell.Section>
    </AppShell.Navbar>
  );
};

export default Sidebar;
