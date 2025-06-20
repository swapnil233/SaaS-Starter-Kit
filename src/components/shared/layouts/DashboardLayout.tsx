import { useSidebarDisclosure } from "@/hooks/ui/useSidebarDisclosure";
import { AppShell, Container } from "@mantine/core";
import { FC, ReactNode } from "react";
import DashboardLayoutHeader from "./DashboardLayoutHeader";
import Sidebar from "./Sidebar/Sidebar";

export interface IDashboardLayout {
  children: ReactNode;
  aside?: ReactNode;
  asideWidth?: number;
}

const DashboardLayout: FC<IDashboardLayout> = ({
  children,
  aside,
  asideWidth = 300,
}) => {
  const {
    mobileSidebarWasExpanded,
    expandMobileSidebar,
    sidebarWasExpanded,
    handleCollapseClick,
    closeMobileSidebar,
    showProBanner,
  } = useSidebarDisclosure();

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: { base: 300, sm: sidebarWasExpanded ? 250 : 80 },
        breakpoint: "sm",
        collapsed: { mobile: !mobileSidebarWasExpanded, desktop: false },
      }}
      {...(aside
        ? {
            aside: {
              width: asideWidth,
              breakpoint: "md",
              collapsed: { desktop: false, mobile: true },
            },
          }
        : {})}
      padding="md"
    >
      <DashboardLayoutHeader
        mobileSidebarWasExpanded={mobileSidebarWasExpanded}
        expandMobileSidebar={expandMobileSidebar}
      />

      <Sidebar
        sidebarWasExpanded={sidebarWasExpanded}
        handleCollapseClick={handleCollapseClick}
        closeMobileSidebar={closeMobileSidebar}
        _showProBanner={showProBanner}
      />

      {aside && <AppShell.Aside p="md">{aside}</AppShell.Aside>}
      <AppShell.Main>
        <Container maw="80rem" w="100%">
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default DashboardLayout;
