import NavButton from "@/components/buttons/NavButton";
import { getNavigationSection } from "@/lib/navigation";
import { Stack } from "@mantine/core";
import { useRouter } from "next/router";
import { FC } from "react";

interface NavListProps {
  isCollapsed: boolean;
  closeMobileSidebarNav: () => void;
}

const NavList: FC<NavListProps> = ({ isCollapsed, closeMobileSidebarNav }) => {
  const router = useRouter();
  const { pathname } = router;
  const section = getNavigationSection(pathname);

  return (
    <Stack h="100%">
      <Stack gap="xs">
        {section.links.map((link) => (
          <NavButton
            key={link.href}
            href={link.href}
            icon={<link.icon size={20} />}
            label={link.label}
            isCollapsed={isCollapsed}
            closeMobileSidebarNav={closeMobileSidebarNav}
            dontPrefetch={link.dontPrefetch}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export default NavList;
