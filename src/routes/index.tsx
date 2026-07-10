import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Container,
  Group,
  Loader,
  Menu,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  IconChevronRight,
  IconDotsVertical,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";

import { requireAdmin } from "@/features/admin/auth/guard";
import ChainForm, { type ChainFormValues } from "@/features/admin/components/forms/ChainForm";
import ColorSchemeToggle from "@/features/admin/components/shell/ColorSchemeToggle";
import LogoutButton from "@/features/admin/components/shell/LogoutButton";
import { confirmDelete } from "@/features/admin/components/ui/confirmDelete";
import { useEditorModal } from "@/features/admin/hooks/useEditorModal";
import {
  type Chain,
  chainKeys,
  chainsQuery,
  createChainFn,
  deleteChainFn,
  updateChainFn,
} from "@/features/admin/server";
import { showErrorNotification, showSuccessNotification } from "@/shared/utils/notifications";

export const Route = createFileRoute("/")({
  beforeLoad: ({ location }) => requireAdmin(location),
  component: ChainsLanding,
});

function ChainsLanding() {
  const { data: chains, isLoading } = useQuery(chainsQuery());
  const editor = useEditorModal<Chain>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: chainKeys.all });

  const saveMutation = useMutation({
    mutationFn: (values: ChainFormValues) =>
      editor.item
        ? updateChainFn({ data: { id: editor.item.id, ...values } })
        : createChainFn({ data: values }),
    onSuccess: async (chain) => {
      await invalidate();
      editor.close();
      showSuccessNotification(`Lagret «${chain.name}»`);
    },
    onError: (error: Error) => showErrorNotification(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteChainFn({ data: { id } }),
    onSuccess: async () => {
      await invalidate();
      showSuccessNotification("Kjede slettet");
    },
    onError: (error: Error) => showErrorNotification(error.message),
  });

  return (
    <Box>
      <Group
        h={56}
        px={"md"}
        justify={"space-between"}
        style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
      >
        <Group gap={8}>
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
            style={{
              letterSpacing: "-0.03em",
              fontFamily: "var(--mantine-font-family-monospace)",
            }}
          >
            mirage
          </Text>
        </Group>
        <Group gap={"xs"} wrap={"nowrap"}>
          <ColorSchemeToggle />
          <LogoutButton />
        </Group>
      </Group>

      <Container size={"lg"} py={"xl"}>
        <Stack gap={4} mb={"xl"}>
          <Title order={1} fw={700} style={{ letterSpacing: "-0.03em" }}>
            Kjeder
          </Title>
          <Text c={"dimmed"}>Velg en kjede, eller opprett en ny.</Text>
        </Stack>

        {isLoading ? (
          <Group justify={"center"} py={"xl"}>
            <Loader />
          </Group>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing={"md"}>
            {chains?.map((chain) => (
              <ChainCard
                key={chain.id}
                chain={chain}
                onOpen={() =>
                  navigate({
                    to: "/chains/$chainId",
                    params: { chainId: String(chain.id) },
                  })
                }
                onEdit={() => editor.openEdit(chain)}
                onDelete={() =>
                  confirmDelete({
                    title: "Slett kjede",
                    message: `Slett «${chain.name}» og alt innhold (regioner, sentre, timer, brukere)? Dette kan ikke angres.`,
                    onConfirm: () => deleteMutation.mutate(chain.id),
                  })
                }
              />
            ))}
            <Card
              withBorder
              padding={"lg"}
              onClick={editor.openCreate}
              style={{
                cursor: "pointer",
                borderStyle: "dashed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 132,
              }}
            >
              <Group gap={8} c={"dimmed"}>
                <IconPlus size={20} />
                <Text fw={500}>Ny kjede</Text>
              </Group>
            </Card>
          </SimpleGrid>
        )}
      </Container>

      <Modal
        opened={editor.opened}
        onClose={editor.close}
        title={editor.item ? "Rediger kjede" : "Ny kjede"}
        centered
      >
        <ChainForm
          {...(editor.item
            ? {
                initial: {
                  name: editor.item.name,
                  identifier: editor.item.identifier,
                },
              }
            : {})}
          submitting={saveMutation.isPending}
          onSubmit={(values) => saveMutation.mutate(values)}
        />
      </Modal>
    </Box>
  );
}

function ChainCard({
  chain,
  onOpen,
  onEdit,
  onDelete,
}: {
  chain: Chain;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card withBorder padding={"lg"} style={{ minHeight: 132 }}>
      <Group justify={"space-between"} wrap={"nowrap"} align={"flex-start"}>
        <Box style={{ cursor: "pointer", flexGrow: 1 }} onClick={onOpen}>
          <Text fw={650} fz={"lg"}>
            {chain.name}
          </Text>
          <Text size={"xs"} c={"dimmed"} ff={"monospace"}>
            {chain.identifier}
          </Text>
        </Box>
        <Menu position={"bottom-end"} withinPortal>
          <Menu.Target>
            <ActionIcon variant={"subtle"} color={"gray"} aria-label={"Handlinger"}>
              <IconDotsVertical size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconPencil size={16} />} onClick={onEdit}>
              Rediger
            </Menu.Item>
            <Menu.Item color={"red"} leftSection={<IconTrash size={16} />} onClick={onDelete}>
              Slett
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Group gap={"xs"} mt={"md"}>
        <Badge variant={"light"} color={"gray"}>
          {chain._count?.branches ?? 0} filialer
        </Badge>
        <Badge variant={"light"} color={"gray"}>
          {chain._count?.activities ?? 0} aktiviteter
        </Badge>
        <Badge variant={"light"} color={"gray"}>
          {chain._count?.users ?? 0} brukere
        </Badge>
      </Group>

      <Group gap={4} mt={"md"} c={"rezervo"} style={{ cursor: "pointer" }} onClick={onOpen}>
        <Text size={"sm"} fw={500}>
          Åpne
        </Text>
        <IconChevronRight size={16} />
      </Group>
    </Card>
  );
}
