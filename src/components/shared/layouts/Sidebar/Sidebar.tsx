import { AppShell, ScrollArea, Stack } from "@mantine/core";
import { FC } from "react";
import CollapseButton from "./CollapseButton";
import NavList from "./NavList";

interface SidebarProps {
  sidebarWasExpanded: boolean;
  handleCollapseClick: () => void;
  closeMobileSidebar: () => void;
  _showProBanner?: boolean;
}

const Sidebar: FC<SidebarProps> = ({
  sidebarWasExpanded,
  handleCollapseClick,
  closeMobileSidebar,
  _showProBanner,
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
