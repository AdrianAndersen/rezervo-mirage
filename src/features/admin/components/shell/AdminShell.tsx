import { AppShell, Box, Burger, Group, NavLink, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link, useRouterState } from "@tanstack/react-router";
import { IconBarbell, IconCalendarWeek, IconMap, IconMapPin, IconUsers } from "@tabler/icons-react";
import type { ReactNode } from "react";

import ChainSwitcher from "./ChainSwitcher";
import ColorSchemeToggle from "./ColorSchemeToggle";
import LogoutButton from "./LogoutButton";

const NAV_ITEMS = [
  { label: "Timer", to: "/chains/$chainId", icon: IconCalendarWeek, exact: true },
  { label: "Regioner", to: "/chains/$chainId/regioner", icon: IconMap },
  { label: "Sentre", to: "/chains/$chainId/sentre", icon: IconMapPin },
  { label: "Aktiviteter", to: "/chains/$chainId/aktiviteter", icon: IconBarbell },
  { label: "Brukere", to: "/chains/$chainId/brukere", icon: IconUsers },
] as const;

function Wordmark() {
  return (
    <Group gap={8} wrap={"nowrap"}>
      <Box
        w={22}
        h={22}
        style={{
          borderRadius: 6,
          background: "var(--mantine-color-rezervo-6)",
          boxShadow: "0 0 0 3px var(--mantine-color-rezervo-light)",
        }}
      />
      <Text
        fw={700}
        fz={"lg"}
        style={{ letterSpacing: "-0.03em", fontFamily: "var(--mantine-font-family-monospace)" }}
      >
        mirage
      </Text>
    </Group>
  );
}

export default function AdminShell({
  chainId,
  children,
}: {
  chainId: number;
  children: ReactNode;
}) {
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 220, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding={"md"}
    >
      <AppShell.Header>
        <Group h={"100%"} px={"md"} justify={"space-between"} wrap={"nowrap"}>
          <Group gap={"md"} wrap={"nowrap"}>
            <Burger opened={opened} onClick={toggle} hiddenFrom={"sm"} size={"sm"} />
            <Wordmark />
          </Group>
          <Group gap={"xs"} wrap={"nowrap"}>
            <ChainSwitcher chainId={chainId} />
            <ColorSchemeToggle />
            <LogoutButton />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p={"sm"}>
        {NAV_ITEMS.map((item) => {
          const href = item.to.replace("$chainId", String(chainId));
          const exact = "exact" in item && item.exact;
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <NavLink
              key={item.to}
              data-testid={`nav-${item.label.toLowerCase()}`}
              renderRoot={(props) => (
                <Link to={item.to} params={{ chainId: String(chainId) }} {...props} />
              )}
              label={item.label}
              leftSection={<item.icon size={19} stroke={1.6} />}
              active={active}
              onClick={close}
              mb={2}
              style={{ borderRadius: "var(--mantine-radius-md)" }}
            />
          );
        })}
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
