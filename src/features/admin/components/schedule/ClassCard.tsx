import { Badge, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";

import type { ClassListItem } from "@/features/admin/server";
import { formatTime } from "@/features/admin/week";

export default function ClassCard({ cls, onClick }: { cls: ClassListItem; onClick: () => void }) {
  const color = cls.activity.color;
  const registered = cls._count.registrations;
  const waitlist = Math.max(0, registered - cls.totalSlots);
  const instructors = cls.instructors.map((i) => i.name).join(", ");

  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        borderRadius: "var(--mantine-radius-sm)",
        borderLeft: `3px solid ${color}`,
        background: `color-mix(in srgb, ${color} 12%, var(--mantine-color-body))`,
        padding: "6px 8px",
        opacity: cls.isCancelled ? 0.55 : 1,
      }}
    >
      <Stack gap={2}>
        <Group gap={6} justify={"space-between"} wrap={"nowrap"}>
          <Text size={"xs"} fw={600} ff={"monospace"} {...(cls.isCancelled ? { c: "dimmed" } : {})}>
            {formatTime(cls.startTime)}–{formatTime(cls.endTime)}
          </Text>
          {cls.isCancelled && (
            <Badge size={"xs"} color={"red"} variant={"light"}>
              Avlyst
            </Badge>
          )}
        </Group>
        <Text size={"sm"} fw={600} lineClamp={1} td={cls.isCancelled ? "line-through" : undefined}>
          {cls.activity.name}
        </Text>
        {instructors && (
          <Text size={"xs"} c={"dimmed"} lineClamp={1}>
            {instructors}
          </Text>
        )}
        <Group gap={4} mt={2} wrap={"nowrap"}>
          <IconUsers size={13} color={"var(--mantine-color-dimmed)"} />
          <Text size={"xs"} c={"dimmed"} ff={"monospace"}>
            {registered}/{cls.totalSlots}
          </Text>
          {waitlist > 0 && (
            <Text size={"xs"} c={"orange"} ff={"monospace"}>
              +{waitlist}
            </Text>
          )}
        </Group>
      </Stack>
    </UnstyledButton>
  );
}
