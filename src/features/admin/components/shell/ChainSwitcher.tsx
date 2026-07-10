import { Button, Menu, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { IconChevronDown, IconSettings } from "@tabler/icons-react";

import { chainsQuery } from "@/features/admin/server";

export default function ChainSwitcher({ chainId }: { chainId: number }) {
  const navigate = useNavigate();
  const { data: chains } = useQuery(chainsQuery());
  const current = chains?.find((c) => c.id === chainId);

  return (
    <Menu position={"bottom-start"} width={240} shadow={"md"}>
      <Menu.Target>
        <Button
          variant={"default"}
          rightSection={<IconChevronDown size={16} />}
          styles={{ label: { fontWeight: 600 } }}
        >
          {current?.name ?? "Velg kjede"}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Kjeder</Menu.Label>
        {chains?.map((chain) => (
          <Menu.Item
            key={chain.id}
            onClick={() =>
              navigate({ to: "/kjeder/$chainSlug", params: { chainSlug: chain.identifier } })
            }
            {...(chain.id === chainId ? { bg: "var(--mantine-primary-color-light)" } : {})}
          >
            <Text size={"sm"} fw={chain.id === chainId ? 600 : 400}>
              {chain.name}
            </Text>
            <Text size={"xs"} c={"dimmed"} ff={"monospace"}>
              {chain.identifier}
            </Text>
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Item leftSection={<IconSettings size={16} />} onClick={() => navigate({ to: "/" })}>
          Administrer kjeder
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
