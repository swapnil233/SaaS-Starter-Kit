import {
  ActionIcon,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

interface ColorSchemeToggleProps {
  size?: number;
}

export function ColorSchemeToggle({ size = 16 }: ColorSchemeToggleProps) {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  return (
    <Tooltip
      label={`Switch to ${computedColorScheme === "dark" ? "light" : "dark"} mode`}
      position="bottom"
    >
      <ActionIcon
        onClick={() =>
          setColorScheme(computedColorScheme === "dark" ? "light" : "dark")
        }
        variant="subtle"
        size="lg"
        aria-label="Toggle color scheme"
      >
        {computedColorScheme === "dark" ? (
          <IconSun style={{ width: size, height: size }} />
        ) : (
          <IconMoon style={{ width: size, height: size }} />
        )}
      </ActionIcon>
    </Tooltip>
  );
}
