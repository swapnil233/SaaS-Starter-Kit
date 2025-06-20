import { NavigationConfig } from "@/types/navigation";
import {
  IconBolt,
  IconChartBar,
  IconFile,
  IconHome,
  IconInbox,
  IconUser,
} from "@tabler/icons-react";

export const navigationConfig: NavigationConfig = {
  sections: {
    default: {
      type: "default",
      links: [
        {
          href: "/dashboard",
          icon: IconHome,
          label: "Dashboard",
        },
        {
          href: "/inbox",
          icon: IconInbox,
          label: "Inbox",
        },
        {
          href: "/reports",
          icon: IconChartBar,
          label: "Reports",
        },
        {
          href: "/documents",
          icon: IconFile,
          label: "Documents",
        },
        {
          href: "/automations",
          icon: IconBolt,
          label: "Automations",
        },
        {
          href: "/account",
          icon: IconUser,
          label: "Account",
        },
      ],
    },
  },
};
