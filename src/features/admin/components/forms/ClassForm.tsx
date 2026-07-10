import { Box, Button, Group, Stack } from "@mantine/core";
import dayjs from "dayjs";

import type { ClassCoreInput } from "@/features/admin/schemas";
import type { Activity, ClassDetail, Location, User } from "@/features/admin/server";
import { useAppForm } from "@/shared/hooks/form";

export interface ClassFormValues {
  activityId: string;
  locationId: string;
  start: string;
  durationMinutes: number;
  bookingOpensHoursBefore: number;
  totalSlots: number;
  room: string;
  isCancelled: boolean;
  cancelText: string;
  instructorIds: string[];
  repeatWeeks: number;
}

const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";

function initialFromClass(cls: ClassDetail): ClassFormValues {
  const start = dayjs(cls.startTime);
  return {
    activityId: String(cls.activityId),
    locationId: String(cls.locationId),
    start: start.format(DATE_FORMAT),
    durationMinutes: dayjs(cls.endTime).diff(start, "minute"),
    bookingOpensHoursBefore: start.diff(dayjs(cls.bookingOpensAt), "hour"),
    totalSlots: cls.totalSlots,
    room: cls.room ?? "",
    isCancelled: cls.isCancelled,
    cancelText: cls.cancelText ?? "",
    instructorIds: cls.instructors.map((i) => String(i.id)),
    repeatWeeks: 1,
  };
}

export default function ClassForm({
  cls,
  defaultStart,
  activities,
  locations,
  employees,
  submitting,
  onSubmit,
}: {
  cls?: ClassDetail;
  defaultStart: string;
  activities: Activity[];
  locations: Location[];
  employees: User[];
  submitting: boolean;
  onSubmit: (payload: ClassCoreInput, repeatWeeks: number) => void;
}) {
  const isEdit = cls !== undefined;
  const form = useAppForm({
    defaultValues: cls
      ? initialFromClass(cls)
      : ({
          activityId: activities[0] ? String(activities[0].id) : "",
          locationId: locations[0] ? String(locations[0].id) : "",
          start: defaultStart,
          durationMinutes: 60,
          bookingOpensHoursBefore: 48,
          totalSlots: 20,
          room: "",
          isCancelled: false,
          cancelText: "",
          instructorIds: [],
          repeatWeeks: 1,
        } satisfies ClassFormValues),
    onSubmit: ({ value }) => {
      const start = dayjs(value.start);
      const payload: ClassCoreInput = {
        activityId: Number(value.activityId),
        locationId: Number(value.locationId),
        startTime: start.toDate(),
        endTime: start.add(value.durationMinutes, "minute").toDate(),
        bookingOpensAt: start.subtract(value.bookingOpensHoursBefore, "hour").toDate(),
        totalSlots: value.totalSlots,
        room: value.room.trim() || null,
        isCancelled: value.isCancelled,
        cancelText: value.cancelText.trim() || null,
        instructorIds: value.instructorIds.map(Number),
      };
      onSubmit(payload, Math.max(1, value.repeatWeeks));
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <Stack>
        <form.AppField name={"activityId"}>
          {(field) => (
            <field.SelectField
              label={"Aktivitet"}
              required
              searchable
              data={activities.map((a) => ({
                value: String(a.id),
                label: a.name,
              }))}
            />
          )}
        </form.AppField>
        <form.AppField name={"locationId"}>
          {(field) => (
            <field.SelectField
              label={"Senter"}
              required
              searchable
              data={locations.map((l) => ({
                value: String(l.id),
                label: l.branch ? `${l.name} · ${l.branch.name}` : l.name,
              }))}
            />
          )}
        </form.AppField>

        <form.AppField name={"start"}>
          {(field) => (
            <field.DateTimePickerField label={"Start"} required valueFormat={"DD.MM.YYYY HH:mm"} />
          )}
        </form.AppField>

        <Group grow>
          <form.AppField name={"durationMinutes"}>
            {(field) => <field.NumberField label={"Varighet (min)"} min={5} step={5} />}
          </form.AppField>
          <form.AppField name={"totalSlots"}>
            {(field) => <field.NumberField label={"Plasser"} min={1} />}
          </form.AppField>
        </Group>

        <Group grow>
          <form.AppField name={"bookingOpensHoursBefore"}>
            {(field) => <field.NumberField label={"Booking åpner (timer før)"} min={0} />}
          </form.AppField>
          <form.AppField name={"room"}>
            {(field) => <field.TextField label={"Rom"} placeholder={"Sal 1"} />}
          </form.AppField>
        </Group>

        <form.AppField name={"instructorIds"}>
          {(field) => (
            <field.MultiSelectField
              label={"Instruktører"}
              placeholder={employees.length === 0 ? "Ingen ansatte" : "Velg ansatte"}
              searchable
              data={employees.map((e) => ({
                value: String(e.id),
                label: e.name,
              }))}
            />
          )}
        </form.AppField>

        <form.AppField name={"isCancelled"}>
          {(field) => <field.SwitchField label={"Avlyst"} />}
        </form.AppField>

        <form.Subscribe selector={(s) => s.values.isCancelled}>
          {(isCancelled) =>
            isCancelled ? (
              <form.AppField name={"cancelText"}>
                {(field) => (
                  <field.TextField label={"Avlysningstekst"} placeholder={"Instruktør syk"} />
                )}
              </form.AppField>
            ) : (
              <Box />
            )
          }
        </form.Subscribe>

        {!isEdit && (
          <form.AppField name={"repeatWeeks"}>
            {(field) => (
              <field.NumberField
                label={"Gjenta (antall uker)"}
                description={"Lager én time per uke fremover."}
                min={1}
                max={52}
              />
            )}
          </form.AppField>
        )}

        <Button type={"submit"} loading={submitting} mt={"xs"}>
          {isEdit ? "Lagre endringer" : "Opprett time"}
        </Button>
      </Stack>
    </form>
  );
}
