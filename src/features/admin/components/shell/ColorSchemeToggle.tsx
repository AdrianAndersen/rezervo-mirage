import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

/**
 * Renders both icons and hides one with CSS (`lightHidden`/`darkHidden`) so the
 * server and client markup match — avoids a color-scheme hydration mismatch.
 */
export default function ColorSchemeToggle() {
  const { setColorScheme } = useMantineColorScheme();

  return (
    <>
      <ActionIcon
        darkHidden
        variant={"subtle"}
        color={"gray"}
        size={"lg"}
        aria-label={"Bytt til mørkt tema"}
        onClick={() => setColorScheme("dark")}
      >
        <IconMoon size={20} />
      </ActionIcon>
      <ActionIcon
        lightHidden
        variant={"subtle"}
        color={"gray"}
        size={"lg"}
        aria-label={"Bytt til lyst tema"}
        onClick={() => setColorScheme("light")}
      >
        <IconSun size={20} />
      </ActionIcon>
    </>
  );
}
