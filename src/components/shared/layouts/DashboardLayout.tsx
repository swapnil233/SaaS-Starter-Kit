import NavButton from "@/components/buttons/NavButton";
import {
  AppShell,
  Burger,
  Group,
  ScrollArea,
  Stack,
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
  IconSearch,
  IconUser,
  IconUserPlus,
} from "@tabler/icons-react";
import { useSession } from "next-auth/react";
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

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />
          <Burger
            opened={desktopOpened}
            onClick={toggleDesktop}
            visibleFrom="sm"
            size="sm"
          />
          <Group gap="xs">
            <TextInput
              leftSection={<IconSearch size="1.1rem" />}
              placeholder="Search and discover"
              miw={300}
              visibleFrom="sm"
            />
            <NotificationsButton newNotifications={newNotifications} />
            <UserNavMenu image={session.data?.user.image || ""} />
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <AppShell.Section p="md" grow component={ScrollArea}>
          <Stack>
            <Stack>
              <Stack gap="xs">
                <NavButton
                  href="/dashboard"
                  icon={<IconHome size={20} />}
                  label="Home"
                  closeMobileNav={closeMobile}
                />
                <NavButton
                  href="/inbox"
                  icon={<IconInbox size={20} />}
                  label="Inbox"
                  closeMobileNav={closeMobile}
                />
                <NavButton
                  href="/reports"
                  icon={<IconChartBar size={20} />}
                  label="Reports"
                  closeMobileNav={closeMobile}
                />
              </Stack>

              <Stack gap="xs">
                <div className="mt-4 px-4 text-xs font-semibold text-gray-400 uppercase">
                  Apps
                </div>
                <NavButton
                  href="/documents"
                  icon={<IconFile size={20} />}
                  label="Documents"
                  closeMobileNav={closeMobile}
                />
                <NavButton
                  href="/automations"
                  icon={<IconBolt size={20} />}
                  label="Automations"
                  closeMobileNav={closeMobile}
                />
              </Stack>

              <Stack gap="xs">
                <div className="mt-4 px-4 text-xs font-semibold text-gray-400 uppercase">
                  Settings
                </div>
                <NavButton
                  href="/dashboard/account"
                  icon={<IconUser size={20} />}
                  label="Account"
                  closeMobileNav={closeMobile}
                />
                <NavButton
                  href="/dashboard/plans"
                  icon={<IconBuildingBank size={20} />}
                  label="Pricing plans"
                  closeMobileNav={closeMobile}
                />
              </Stack>
            </Stack>
            <div className="absolute bottom-0 left-0 p-4 w-full border-t">
              <NavButton
                href="/invite"
                icon={<IconUserPlus size={20} />}
                label="Invite people"
                closeMobileNav={closeMobile}
              />
            </div>
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main bg="#f7fafd">{children}</AppShell.Main>
    </AppShell>
  );
};

export default DashboardLayout;
