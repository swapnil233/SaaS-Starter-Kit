import ProBanner from "@/components/billing/pro-banner";
import NavButton from "@/components/buttons/NavButton";
import app from "@/lib/app";
import {
  AppShell,
  Burger,
  Group,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBolt,
  IconBuildingBank,
  IconChartBar,
  IconFile,
  IconHome,
  IconInbox,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconSearch,
  IconUser,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FC, ReactNode, useState } from "react";
import NotificationsButton from "../user/NotificationsButton";
import UserNavMenu from "../user/UserNavMenu";

export interface IDashboardLayout {
  children: ReactNode;
}

const DashboardLayout: FC<IDashboardLayout> = ({ children }) => {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const [newNotifications] = useState(false);
  const session = useSession();
  const [showProBanner, setShowProBanner] = useState<boolean | null>(true);

  const handleCollapseClick = () => {
    toggleDesktop();
    closeMobile();

    if (showProBanner) {
      setShowProBanner(false);
    }
  };

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: { base: 300, sm: desktopOpened ? 250 : 80 },
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: false },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between" wrap="nowrap">
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />
          {app.logoUrl && (
            <Link href="/">
              <Group align="center" wrap="nowrap" gap="sm">
                <Image
                  src={app.logoUrl}
                  alt={app.logoUrlAlt}
                  height={38}
                  width={38}
                />
                <Text size="xl" fw={700} visibleFrom="sm">
                  {app.name}
                </Text>
              </Group>
            </Link>
          )}
          <Group gap="xs" justify="flex-end" w="100%">
            <TextInput
              leftSection={<IconSearch size="1.1rem" />}
              placeholder="Search and discover"
              miw={300}
              visibleFrom="sm"
            />
            <NotificationsButton newNotifications={newNotifications} />
            <UserNavMenu
              name={session.data?.user.name || "Loading..."}
              email={session.data?.user.email || "Loading..."}
              image={session.data?.user.image || ""}
            />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        w={{ base: 300, sm: desktopOpened ? 250 : 80 }}
        style={{ zIndex: 200 }}
      >
        <AppShell.Section px="md" pt="md" pb={0} grow component={ScrollArea}>
          <Stack h="100%">
            <Stack gap="xs">
              <NavButton
                href="/dashboard"
                icon={<IconHome size={20} />}
                label="Home"
                isCollapsed={!desktopOpened}
                closeMobileNav={closeMobile}
              />
              <NavButton
                href="/inbox"
                icon={<IconInbox size={20} />}
                label="Inbox"
                isCollapsed={!desktopOpened}
                closeMobileNav={closeMobile}
              />
              <NavButton
                href="/reports"
                icon={<IconChartBar size={20} />}
                label="Reports"
                isCollapsed={!desktopOpened}
                closeMobileNav={closeMobile}
              />
              {desktopOpened && (
                <div className="mt-4 px-4 text-xs font-semibold text-gray-400 uppercase">
                  Apps
                </div>
              )}
              <NavButton
                href="/documents"
                icon={<IconFile size={20} />}
                label="Documents"
                isCollapsed={!desktopOpened}
                closeMobileNav={closeMobile}
              />
              <NavButton
                href="/automations"
                icon={<IconBolt size={20} />}
                label="Automations"
                isCollapsed={!desktopOpened}
                closeMobileNav={closeMobile}
              />
              {desktopOpened && (
                <div className="mt-4 px-4 text-xs font-semibold text-gray-400 uppercase">
                  Settings
                </div>
              )}
              <NavButton
                href="/dashboard/account"
                icon={<IconUser size={20} />}
                label="Account"
                isCollapsed={!desktopOpened}
                closeMobileNav={closeMobile}
              />
              <NavButton
                href="/dashboard/plans"
                icon={<IconBuildingBank size={20} />}
                label="Pricing plans"
                isCollapsed={!desktopOpened}
                closeMobileNav={closeMobile}
              />
            </Stack>
          </Stack>
        </AppShell.Section>
        <AppShell.Section px="md" py={"xs"} visibleFrom="sm">
          <Stack>
            {showProBanner && <ProBanner setShowProBanner={setShowProBanner} />}
            <NavButton
              href="#"
              icon={
                desktopOpened ? (
                  <IconLayoutSidebarLeftCollapse size={20} />
                ) : (
                  <IconLayoutSidebarLeftExpand size={20} />
                )
              }
              label="Collapse"
              isCollapsed={!desktopOpened}
              closeMobileNav={handleCollapseClick}
            />
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main bg="#f7fafd">{children}</AppShell.Main>
    </AppShell>
  );
};

export default DashboardLayout;
