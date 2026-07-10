import { ActionIcon, Card, Group, Loader, Menu, Stack, Table, Text } from "@mantine/core";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
}

export default function CrudTable<T extends { id: number }>({
  columns,
  rows,
  isLoading,
  emptyText,
  onEdit,
  onDelete,
}: {
  columns: Column<T>[];
  rows: T[] | undefined;
  isLoading: boolean;
  emptyText: string;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
}) {
  if (isLoading) {
    return (
      <Group justify={"center"} py={"xl"}>
        <Loader />
      </Group>
    );
  }
  if (!rows || rows.length === 0) {
    return (
      <Card withBorder py={"xl"}>
        <Text ta={"center"} c={"dimmed"}>
          {emptyText}
        </Text>
      </Card>
    );
  }

  return (
    <Card withBorder padding={0}>
      <Table.ScrollContainer minWidth={480}>
        <Table highlightOnHover verticalSpacing={"sm"} horizontalSpacing={"md"}>
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th key={col.header}>{col.header}</Table.Th>
              ))}
              <Table.Th w={52} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((row) => (
              <Table.Tr key={row.id}>
                {columns.map((col) => (
                  <Table.Td key={col.header}>{col.render(row)}</Table.Td>
                ))}
                <Table.Td>
                  <Menu position={"bottom-end"} withinPortal>
                    <Menu.Target>
                      <ActionIcon
                        data-testid={`row-actions-${row.id}`}
                        variant={"subtle"}
                        color={"gray"}
                        aria-label={"Handlinger"}
                      >
                        <IconDotsVertical size={18} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        data-testid={`row-edit-${row.id}`}
                        leftSection={<IconPencil size={16} />}
                        onClick={() => onEdit(row)}
                      >
                        Rediger
                      </Menu.Item>
                      <Menu.Item
                        data-testid={`row-delete-${row.id}`}
                        color={"red"}
                        leftSection={<IconTrash size={16} />}
                        onClick={() => onDelete(row)}
                      >
                        Slett
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Card>
  );
}

/** A monospace id/slug cell. */
export function SlugCell({ children }: { children: ReactNode }) {
  return (
    <Text ff={"monospace"} size={"sm"} c={"dimmed"}>
      {children}
    </Text>
  );
}

export function StackedCell({ title, subtitle }: { title: ReactNode; subtitle?: ReactNode }) {
  return (
    <Stack gap={0}>
      <Text fw={500} size={"sm"}>
        {title}
      </Text>
      {subtitle !== undefined && (
        <Text size={"xs"} c={"dimmed"}>
          {subtitle}
        </Text>
      )}
    </Stack>
  );
}
