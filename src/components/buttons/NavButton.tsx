import Link from "next/link";
import { useRouter } from "next/router";
import { FC, ReactNode } from "react";

interface NavButtonProps {
  href: string;
  icon: ReactNode;
  label: string;
}

const NavButton: FC<NavButtonProps> = ({ href, icon, label }) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link
      href={href}
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
