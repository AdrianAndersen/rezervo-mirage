import { ActionIcon, Button, Group, MultiSelect, Stack, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconPlus } from "@tabler/icons-react";
import type { Dayjs } from "dayjs";

import type { Location } from "@/features/admin/server";
import { formatWeekRange, weekNumber } from "@/features/admin/week";

export default function WeekNavigator({
  date,
  locations,
  selectedLocationIds,
  onPrev,
  onNext,
  onToday,
  onChangeLocations,
  onNewClass,
}: {
  date: Dayjs;
  locations: Location[];
  selectedLocationIds: string[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onChangeLocations: (ids: string[]) => void;
  onNewClass: () => void;
}) {
  return (
    <Group justify={"space-between"} align={"flex-end"} mb={"md"} wrap={"wrap"} gap={"sm"}>
      <Group gap={"sm"} wrap={"nowrap"}>
        <Group gap={4} wrap={"nowrap"}>
          <ActionIcon variant={"default"} size={"lg"} onClick={onPrev} aria-label={"Forrige uke"}>
            <IconChevronLeft size={18} />
          </ActionIcon>
          <Button variant={"default"} onClick={onToday}>
            I dag
          </Button>
          <ActionIcon variant={"default"} size={"lg"} onClick={onNext} aria-label={"Neste uke"}>
            <IconChevronRight size={18} />
          </ActionIcon>
        </Group>
        <Stack gap={0}>
          <Text fw={650} fz={"lg"} style={{ letterSpacing: "-0.02em" }}>
            Uke {weekNumber(date)}
          </Text>
          <Text size={"xs"} c={"dimmed"}>
            {formatWeekRange(date)}
          </Text>
        </Stack>
      </Group>

      <Group gap={"sm"} wrap={"nowrap"}>
        <MultiSelect
          data={locations.map((l) => ({ value: String(l.id), label: l.name }))}
          value={selectedLocationIds}
          onChange={onChangeLocations}
          placeholder={selectedLocationIds.length === 0 ? "Alle sentre" : ""}
          clearable
          searchable
          w={220}
          maxDropdownHeight={280}
          comboboxProps={{ withinPortal: true }}
        />
        <Button leftSection={<IconPlus size={18} />} onClick={onNewClass}>
          Ny time
        </Button>
      </Group>
    </Group>
  );
}
