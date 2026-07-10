import {
  Badge,
  Button,
  Card,
  Group,
  NumberInput,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconDice5, IconPlus, IconSearch, IconX } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useState } from "react";

import {
  addRandomRegistrationsFn,
  addRegistrationsFn,
  classKeys,
  deleteRegistrationFn,
  type Registration,
  type User,
} from "@/features/admin/server";
import { showErrorNotification } from "@/shared/utils/notifications";

const PANEL_HEIGHT = 260;

export default function ParticipantsTransfer({
  classId,
  totalSlots,
  registrations,
  users,
}: {
  classId: number;
  totalSlots: number;
  registrations: Registration[];
  users: User[];
}) {
  const [search, setSearch] = useState("");
  const [randomCount, setRandomCount] = useState<number | string>(5);
  const queryClient = useQueryClient();

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: classKeys.detail(classId) }),
      queryClient.invalidateQueries({ queryKey: classKeys.all }),
    ]);
  const onError = (error: Error) => showErrorNotification(error.message);

  const add = useMutation({
    mutationFn: (userId: number) => addRegistrationsFn({ data: { classId, userIds: [userId] } }),
    onSuccess: invalidate,
    onError,
  });
  const remove = useMutation({
    mutationFn: (userId: number) => deleteRegistrationFn({ data: { classId, userId } }),
    onSuccess: invalidate,
    onError,
  });
  const random = useMutation({
    mutationFn: (count: number) => addRandomRegistrationsFn({ data: { classId, count } }),
    onSuccess: invalidate,
    onError,
  });

  const registeredIds = new Set(registrations.map((r) => r.userId));
  const available = users
    .filter((u) => !registeredIds.has(u.id))
    .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Stack gap={"sm"}>
      <Group justify={"space-between"} align={"flex-end"}>
        <Text fw={600} size={"sm"}>
          Deltakere
        </Text>
        <Group gap={"xs"} wrap={"nowrap"}>
          <NumberInput
            value={randomCount}
            onChange={setRandomCount}
            min={1}
            w={72}
            size={"xs"}
            aria-label={"Antall tilfeldige"}
          />
          <Button
            size={"xs"}
            variant={"light"}
            leftSection={<IconDice5 size={16} />}
            loading={random.isPending}
            onClick={() => random.mutate(Number(randomCount) || 1)}
          >
            Tilfeldige
          </Button>
        </Group>
      </Group>

      <Group grow align={"flex-start"} gap={"sm"}>
        <Card withBorder padding={"xs"}>
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder={"Søk"}
            leftSection={<IconSearch size={14} />}
            size={"xs"}
            mb={"xs"}
          />
          <Text size={"xs"} c={"dimmed"} mb={4}>
            Tilgjengelige ({available.length})
          </Text>
          <ScrollArea h={PANEL_HEIGHT}>
            <Stack gap={2}>
              {available.map((u) => (
                <Row
                  key={u.id}
                  label={u.name}
                  icon={<IconPlus size={14} />}
                  onClick={() => add.mutate(u.id)}
                />
              ))}
              {available.length === 0 && <Empty text={"Ingen tilgjengelige"} />}
            </Stack>
          </ScrollArea>
        </Card>

        <Card withBorder padding={"xs"}>
          <Text size={"xs"} c={"dimmed"} mb={4} h={30} style={{ lineHeight: "30px" }}>
            Påmeldte ({registrations.length}/{totalSlots})
          </Text>
          <ScrollArea h={PANEL_HEIGHT}>
            <Stack gap={2}>
              {registrations.map((r, index) => (
                <Row
                  key={r.id}
                  label={r.user.name}
                  icon={<IconX size={14} />}
                  onClick={() => remove.mutate(r.userId)}
                  trailing={
                    index >= totalSlots ? (
                      <Badge size={"xs"} color={"orange"} variant={"light"}>
                        venteliste {index - totalSlots + 1}
                      </Badge>
                    ) : (
                      <Badge size={"xs"} color={"rezervo"} variant={"light"}>
                        påmeldt
                      </Badge>
                    )
                  }
                />
              ))}
              {registrations.length === 0 && <Empty text={"Ingen påmeldte ennå"} />}
            </Stack>
          </ScrollArea>
        </Card>
      </Group>
    </Stack>
  );
}

function Row({
  label,
  icon,
  trailing,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  trailing?: ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      variant={"subtle"}
      color={"gray"}
      size={"xs"}
      fullWidth
      justify={"space-between"}
      leftSection={icon}
      {...(trailing !== undefined ? { rightSection: trailing } : {})}
      onClick={onClick}
      styles={{ label: { fontWeight: 400 }, inner: { justifyContent: "space-between" } }}
    >
      {label}
    </Button>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <Text size={"xs"} c={"dimmed"} ta={"center"} py={"md"}>
      {text}
    </Text>
  );
}
