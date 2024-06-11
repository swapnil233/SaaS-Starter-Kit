import { forwardRef } from "react";
import { IconChevronRight } from "@tabler/icons-react";
import { Group, Avatar, Text, UnstyledButton } from "@mantine/core";

interface UserButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  image: string;
  name: string;
  email: string;
  icon?: React.ReactNode;
}

const UserButton = forwardRef<HTMLButtonElement, UserButtonProps>(
  ({ image, name, email, icon, ...others }, ref) => {
    return (
      <UnstyledButton
        ref={ref}
        style={{
          padding: "var(--mantine-spacing-md)",
          color: "var(--mantine-color-text)",
          borderRadius: "var(--mantine-radius-sm)",
        }}
        {...others}
      >
        <Group>
          <Avatar src={image} radius="xl" />

          <div style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              {name}
            </Text>

            <Text c="dimmed" size="xs">
              {email}
            </Text>
          </div>

          {icon || <IconChevronRight size="1rem" />}
        </Group>
      </UnstyledButton>
    );
  }
);

// eslint complains otherwise
UserButton.displayName = "UserButton";

export default UserButton;
