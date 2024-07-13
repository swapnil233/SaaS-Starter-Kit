import Link from "next/link";
import { useRouter } from "next/router";
import { FC, ReactNode } from "react";

interface NavButtonProps {
  href: string;
  icon: ReactNode;
  label: string;
  closeMobileNav: () => void;
}

const NavButton: FC<NavButtonProps> = ({
  href,
  icon,
  label,
  closeMobileNav,
}) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    closeMobileNav();
    router.push(href);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`flex items-center px-4 py-3 text-sm rounded-md ${
        isActive
          ? "bg-gray-200 text-gray-900 font-semibold"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <span className="mr-3">{icon}</span>
      {label}
    </Link>
  );
};

export default NavButton;
