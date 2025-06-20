import { IconProps } from "@tabler/icons-react";
import { FC } from "react";

export interface NavLink {
  href: string;
  as?: string;
  icon: FC<IconProps>;
  label: string;
  dontPrefetch?: boolean;
  children?: NavLink[];
  creatorOnly?: boolean;
}

export interface NavSection {
  type: "project" | "team" | "default";
  links: NavLink[];
}

export interface NavigationConfig {
  sections: Record<string, NavSection>;
}
