import {
  Avatar,
  Menu,
  MenuDivider,
  rem,
  Stack,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconGift,
  IconLogout,
  IconMoon,
  IconSun,
  IconUser,
} from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { FC } from "react";
import UserButton from "./UserButton";

interface IUserNavMenu {
  image: string;
  name: string;
  email: string;
}

const UserNavMenu: FC<IUserNavMenu> = ({ image, name, email }) => {
  const computedColorScheme = useComputedColorScheme("light");
  const { setColorScheme } = useMantineColorScheme();

  const handleThemeToggle = () => {
    setColorScheme(computedColorScheme === "dark" ? "light" : "dark");
  };

  return (
    <Menu>
      <Menu.Target>
        <UserButton image={image} />
      </Menu.Target>

      <Menu.Dropdown
        p={0}
        maw="calc(100vw - 10px)"
        w={300}
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0.1) 0px 1px 3px, rgba(0, 0, 0, 0.06) 0px 4px 8px",
          boxSizing: "border-box",
        }}
      >
        <Stack py="md" px="xl" justify="center" align="center">
          <Avatar
            src={image}
            alt="User avatar"
            w={60}
            h={60}
            className="rounded-full"
          />
          <Stack gap="2">
            <Text ta="center" fw="bold">
              {name}
            </Text>
            <Text ta="center" size="xs" c="dimmed">
              {email}
            </Text>
          </Stack>
        </Stack>
        <MenuDivider m={0} p={0} />
        <Stack py="sm" gap={"xs"}>
          <Menu.Item
            leftSection={
              <IconUser style={{ width: rem(16), height: rem(16) }} />
            }
            component={Link}
            href={"/account"}
          >
            Account
          </Menu.Item>
          <Menu.Item
            leftSection={
              computedColorScheme === "dark" ? (
                <IconSun style={{ width: rem(16), height: rem(16) }} />
              ) : (
                <IconMoon style={{ width: rem(16), height: rem(16) }} />
              )
            }
            onClick={handleThemeToggle}
          >
            {computedColorScheme === "dark" ? "Light" : "Dark"} mode
          </Menu.Item>
        </Stack>
        <MenuDivider m={0} p={0} />
        <Stack py="sm" gap={"xs"}>
          <Menu.Item
            leftSection={
              <IconGift style={{ width: rem(16), height: rem(16) }} />
            }
            component={Link}
            href={"/dashboard/plans"}
          >
            Upgrade plan
          </Menu.Item>
        </Stack>
        <MenuDivider m={0} p={0} />
        <Stack py="sm" m={0} gap={"xs"}>
          <Menu.Item
            onClick={() =>
              signOut({
                redirect: true,
                callbackUrl: "/",
              })
            }
            color="red"
            leftSection={
              <IconLogout style={{ width: rem(16), height: rem(16) }} />
            }
          >
            Sign out
          </Menu.Item>
        </Stack>
      </Menu.Dropdown>
    </Menu>
  );
};

export default UserNavMenu;
