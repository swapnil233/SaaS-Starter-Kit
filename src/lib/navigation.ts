import { navigationConfig } from "@/config/navigation";
import { NavSection } from "@/types/navigation";

export function getNavigationSection(_pathname: string): NavSection {
  return navigationConfig.sections.default;
}

export function generateDynamicAs(
  href: string,
  params: Record<string, string>
): string {
  let asPath = href;
  Object.entries(params).forEach(([key, value]) => {
    asPath = asPath.replace(`[${key}]`, value);
  });
  return asPath;
}

export function isLinkActive(currentPath: string, navPath: string): boolean {
  // Exact match
  if (currentPath === navPath) return true;

  // Check if current path is a sub-path of nav path
  // But only if nav path isn't just "/"
  if (navPath !== "/" && currentPath.startsWith(navPath + "/")) return true;

  // Special case for dynamic routes
  const dynamicNavPath = navPath.replace(/\[.*?\]/g, "[^/]+");
  const dynamicRegex = new RegExp(`^${dynamicNavPath}(/.*)?$`);
  return dynamicRegex.test(currentPath);
}
