import dayjs, { type Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export const WEEKDAYS_NB = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
  "Søndag",
] as const;

/** Monday 00:00 of the week containing `date`. */
export function startOfWeek(date: Dayjs): Dayjs {
  return date.isoWeekday(1).startOf("day");
}

export function weekNumber(date: Dayjs): number {
  return date.isoWeek();
}

export interface WeekDay {
  date: Dayjs;
  label: string;
  isToday: boolean;
}

/** The seven days (Mon–Sun) of the week containing `date`. */
export function weekDays(date: Dayjs): WeekDay[] {
  const monday = startOfWeek(date);
  const today = dayjs();
  return WEEKDAYS_NB.map((label, i) => {
    const dayDate = monday.add(i, "day");
    return { date: dayDate, label, isToday: dayDate.isSame(today, "day") };
  });
}

export function formatWeekRange(date: Dayjs): string {
  const monday = startOfWeek(date);
  const sunday = monday.add(6, "day");
  const sameMonth = monday.isSame(sunday, "month");
  return sameMonth
    ? `${monday.format("D.")}–${sunday.format("D. MMMM")}`
    : `${monday.format("D. MMM")} – ${sunday.format("D. MMM")}`;
}

export const formatTime = (value: string | Date): string => dayjs(value).format("HH:mm");
