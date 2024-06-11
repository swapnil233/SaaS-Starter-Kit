import { Menu, MenuDivider, rem } from "@mantine/core";
import { FC } from "react";
import UserButton from "./UserButton";
import { IconLogout, IconSettings, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface IUserNavMenu {
  name: string;
  email: string;
  image: string;
}

const UserNavMenu: FC<IUserNavMenu> = ({ name, email, image }) => {
  return (
    <Menu position="right-end" withArrow>
      <Menu.Target>
        <UserButton image={image} name={name} email={email} />
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}
          component={Link}
          href={"/profile"}
        >
          Profile
        </Menu.Item>
        <MenuDivider />
        <Menu.Item
          onClick={() =>
            signOut({
              redirect: true,
              callbackUrl: "/",
            })
          }
          color="red"
          leftSection={
            <IconLogout style={{ width: rem(14), height: rem(14) }} />
          }
        >
          Log out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserNavMenu;
