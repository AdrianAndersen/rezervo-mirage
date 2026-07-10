import { Alert, Center, Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import dayjs, { type Dayjs } from "dayjs";
import { useMemo, useState } from "react";

import ClassEditorModal from "@/features/admin/components/schedule/ClassEditorModal";
import WeekGrid from "@/features/admin/components/schedule/WeekGrid";
import WeekNavigator from "@/features/admin/components/schedule/WeekNavigator";
import {
  activitiesQuery,
  type ClassListItem,
  classesQuery,
  locationsQuery,
} from "@/features/admin/server";
import { startOfWeek, weekDays } from "@/features/admin/week";

export const Route = createFileRoute("/chains/$chainId/")({
  component: TimerPage,
});

const START_FORMAT = "YYYY-MM-DD HH:mm:ss";
const defaultStartOn = (day: Dayjs) => day.hour(8).minute(0).second(0).format(START_FORMAT);

interface EditorState {
  open: boolean;
  classId: number | null;
  defaultStart: string;
}

function TimerPage() {
  const chainId = Number(Route.useParams().chainId);
  const [anchor, setAnchor] = useState<Dayjs>(() => startOfWeek(dayjs()));
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [editor, setEditor] = useState<EditorState>({
    open: false,
    classId: null,
    defaultStart: defaultStartOn(startOfWeek(dayjs())),
  });

  const from = anchor.toDate();
  const to = anchor.add(7, "day").toDate();

  const { data: classes, isLoading } = useQuery(classesQuery(chainId, from, to));
  const { data: locations } = useQuery(locationsQuery(chainId));
  const { data: activities } = useQuery(activitiesQuery(chainId));

  const days = useMemo(() => weekDays(anchor), [anchor]);

  const classesByDay = useMemo(() => {
    const map = new Map<string, ClassListItem[]>();
    const selected = new Set(selectedLocationIds);
    for (const cls of classes ?? []) {
      if (selected.size > 0 && !selected.has(String(cls.locationId))) continue;
      const key = dayjs(cls.startTime).format("YYYY-MM-DD");
      const bucket = map.get(key);
      if (bucket) bucket.push(cls);
      else map.set(key, [cls]);
    }
    return map;
  }, [classes, selectedLocationIds]);

  const canCreate = (locations?.length ?? 0) > 0 && (activities?.length ?? 0) > 0;

  const openCreate = (day: Dayjs) =>
    setEditor({ open: true, classId: null, defaultStart: defaultStartOn(day) });
  const openEdit = (cls: ClassListItem) =>
    setEditor({
      open: true,
      classId: cls.id,
      defaultStart: defaultStartOn(anchor),
    });
  const closeEditor = () => setEditor((s) => ({ ...s, open: false }));

  return (
    <>
      <WeekNavigator
        date={anchor}
        locations={locations ?? []}
        selectedLocationIds={selectedLocationIds}
        onPrev={() => setAnchor((d) => d.subtract(7, "day"))}
        onNext={() => setAnchor((d) => d.add(7, "day"))}
        onToday={() => setAnchor(startOfWeek(dayjs()))}
        onChangeLocations={setSelectedLocationIds}
        onNewClass={() => openCreate(anchor)}
      />

      {!canCreate && (
        <Alert color={"gray"} mb={"md"} variant={"light"}>
          Opprett minst én lokasjon og én aktivitet før du kan lage timer.
        </Alert>
      )}

      {isLoading ? (
        <Center py={"xl"}>
          <Loader />
        </Center>
      ) : (
        <WeekGrid
          days={days}
          classesByDay={classesByDay}
          onClassClick={openEdit}
          onAddOnDay={openCreate}
        />
      )}

      <ClassEditorModal
        chainId={chainId}
        opened={editor.open}
        classId={editor.classId}
        defaultStart={editor.defaultStart}
        onClose={closeEditor}
      />
    </>
  );
}
