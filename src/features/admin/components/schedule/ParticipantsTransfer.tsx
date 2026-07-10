import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  NumberInput,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconDice5, IconPlus, IconSearch, IconX } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useState } from "react";

import {
  addRandomRegistrationsFn,
  addRegistrationsFn,
  classKeys,
  deleteRegistrationFn,
  type Registration,
  setRegistrationAttendanceFn,
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
  const attendance = useMutation({
    mutationFn: (vars: { userId: number; attended: boolean }) =>
      setRegistrationAttendanceFn({
        data: { classId, userId: vars.userId, attended: vars.attended },
      }),
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
              {registrations.map((r, index) => {
                const attended = r.checkedInAt !== null;
                const waitlisted = index >= totalSlots;
                return (
                  <Group
                    key={r.id}
                    gap={"xs"}
                    wrap={"nowrap"}
                    justify={"space-between"}
                    px={"xs"}
                    py={4}
                  >
                    <Text size={"sm"} style={{ flex: 1, minWidth: 0 }} truncate>
                      {r.user.name}
                    </Text>
                    <Tooltip label={attended ? "Fjern møtt-status" : "Marker som møtt"} withArrow>
                      <Badge
                        size={"xs"}
                        variant={attended ? "filled" : "light"}
                        color={attended ? "green" : waitlisted ? "orange" : "rezervo"}
                        style={{ cursor: "pointer" }}
                        {...(attended ? { leftSection: <IconCheck size={10} /> } : {})}
                        onClick={() => attendance.mutate({ userId: r.userId, attended: !attended })}
                      >
                        {attended
                          ? "møtt"
                          : waitlisted
                            ? `venteliste ${index - totalSlots + 1}`
                            : "påmeldt"}
                      </Badge>
                    </Tooltip>
                    <ActionIcon
                      variant={"subtle"}
                      color={"gray"}
                      size={"sm"}
                      aria-label={"Fjern deltaker"}
                      onClick={() => remove.mutate(r.userId)}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </Group>
                );
              })}
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
