import NotificationsButton from "@/components/shared/user/NotificationsButton";
import app from "@/lib/app";
import { UserButton } from "@clerk/nextjs";
import { AppShell, Burger, Group, Text } from "@mantine/core";
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
        <Group align="center" wrap="nowrap" gap="md">
          {!mobileSidebarWasExpanded && app.logoUrl && (
            <Group align="center" wrap="nowrap" gap="sm">
              <Link href="/">
                <Image
                  src={app.logoUrl.light}
                  alt={app.logoUrlAlt}
                  height={60}
                  width={60}
                />
              </Link>
              <Text size="xl" fw={700} visibleFrom="sm">
                {app.name}
              </Text>
              <ColorSchemeToggle />
            </Group>
          )}
        </Group>

        <Group gap="xs" justify="flex-end" w="100%">
          <NotificationsButton newNotifications={newNotifications} />
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
              },
            }}
            showName={false}
          />
        </Group>
      </Group>
    </AppShell.Header>
  );
};

export default DashboardLayoutHeader;
