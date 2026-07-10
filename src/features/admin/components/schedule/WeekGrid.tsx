import { Box, Button, Stack, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import type { Dayjs } from "dayjs";

import type { ClassListItem } from "@/features/admin/server";
import type { WeekDay } from "@/features/admin/week";

import ClassCard from "./ClassCard";

export default function WeekGrid({
  days,
  classesByDay,
  onClassClick,
  onAddOnDay,
}: {
  days: WeekDay[];
  classesByDay: Map<string, ClassListItem[]>;
  onClassClick: (cls: ClassListItem) => void;
  onAddOnDay: (date: Dayjs) => void;
}) {
  return (
    <Box style={{ overflowX: "auto" }}>
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(160px, 1fr))",
          gap: "var(--mantine-spacing-xs)",
          minWidth: 7 * 160,
        }}
      >
        {days.map((day) => {
          const key = day.date.format("YYYY-MM-DD");
          const dayClasses = classesByDay.get(key) ?? [];
          return (
            <Box
              key={key}
              style={{
                borderRadius: "var(--mantine-radius-md)",
                border: "1px solid var(--mantine-color-default-border)",
                background: day.isToday ? "var(--mantine-color-rezervo-light)" : "transparent",
                overflow: "hidden",
              }}
            >
              <Box
                px={"sm"}
                py={6}
                style={{
                  borderBottom: "1px solid var(--mantine-color-default-border)",
                }}
              >
                <Text size={"sm"} fw={600}>
                  {day.label}
                </Text>
                <Text size={"xs"} c={day.isToday ? "rezervo" : "dimmed"} ff={"monospace"}>
                  {day.date.format("D. MMM")}
                </Text>
              </Box>
              <Stack gap={6} p={6} mih={80}>
                {dayClasses.map((cls) => (
                  <ClassCard key={cls.id} cls={cls} onClick={() => onClassClick(cls)} />
                ))}
                <Button
                  variant={"subtle"}
                  color={"gray"}
                  size={"xs"}
                  leftSection={<IconPlus size={14} />}
                  onClick={() => onAddOnDay(day.date)}
                  styles={{ root: { opacity: 0.7 } }}
                >
                  Legg til
                </Button>
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
