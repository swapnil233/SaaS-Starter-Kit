import NotificationsButton from "@/components/shared/user/NotificationsButton";
import UserNavMenu from "@/components/shared/user/UserNavMenu";
import app from "@/lib/app";
import { AppShell, Burger, Group, Text } from "@mantine/core";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FC, useState } from "react";
import { ColorSchemeToggle } from "../user/ColorSchemeToggle";

interface DashboardLayoutHeaderProps {
  mobileSidebarWasExpanded: boolean;
  expandMobileSidebar: () => void;
}

const DashboardLayoutHeader: FC<DashboardLayoutHeaderProps> = ({
  mobileSidebarWasExpanded,
  expandMobileSidebar,
}) => {
  const session = useSession();
  const [newNotifications] = useState(false);

  return (
    <AppShell.Header>
      <Group h="100%" px="md" justify="space-between" wrap="nowrap">
        <Burger
          opened={mobileSidebarWasExpanded}
          onClick={expandMobileSidebar}
          hiddenFrom="sm"
          size="sm"
        />
        <Group align="center" wrap="nowrap" gap="sm">
          {!mobileSidebarWasExpanded && app.logoUrl && (
            <Link href="/">
              <Group align="center" wrap="nowrap" gap="sm">
                <Image
                  src={app.logoUrl.light}
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
          <ColorSchemeToggle />
        </Group>

        <Group gap="xs" justify="flex-end" w="100%">
          <NotificationsButton newNotifications={newNotifications} />
          <UserNavMenu
            name={session.data?.user.name || "Loading..."}
            email={session.data?.user.email || "Loading..."}
            image={session.data?.user.image || ""}
          />
        </Group>
      </Group>
    </AppShell.Header>
  );
};

export default DashboardLayoutHeader;
