import {
  AppShell,
  Burger,
  Button,
  Group,
  ScrollArea,
  Stack,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FC, ReactNode, useState } from "react";
import NotificationsButton from "../user/NotificationsButton";
import UserNavMenu from "../user/UserNavMenu";

export interface IDashboardLayout {
  children: ReactNode;
}

const DashboardLayout: FC<IDashboardLayout> = ({ children }) => {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const [newNotifications, setNewNotifications] = useState(false);
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
          <Stack align="flex-start">
            <Button component={Link} href="/dashboard">
              Dashboard
            </Button>
            <Button component={Link} href="/dashboard/plans">
              Plans
            </Button>
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main bg="#f7f7f7">{children}</AppShell.Main>
    </AppShell>
  );
};

export default DashboardLayout;
