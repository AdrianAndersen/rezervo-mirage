import { serializeClass, type ClassWithDetails } from "./serialize";
import type { ScheduleDay, ScheduleResponse } from "./types";

export const DEFAULT_SCHEDULE_DAYS = 7;
export const MAX_SCHEDULE_DAYS = 90;

/** Midnight (UTC) of the given date. */
export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function utcDateKey(date: Date): string {
  return startOfUtcDay(date).toISOString().slice(0, 10);
}

/**
 * Group classes into one entry per day in the `[from, from + days)` window.
 * Days without classes are included as empty entries, mirroring rezervo's
 * `RezervoSchedule`.
 */
export function buildScheduleResponse(
  from: Date,
  days: number,
  classes: ClassWithDetails[],
): ScheduleResponse {
  const classesByDay = new Map<string, ClassWithDetails[]>();
  for (const cls of classes) {
    const key = utcDateKey(cls.startTime);
    const bucket = classesByDay.get(key);
    if (bucket) {
      bucket.push(cls);
    } else {
      classesByDay.set(key, [cls]);
    }
  }

  const start = startOfUtcDay(from);
  const scheduleDays: ScheduleDay[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(start.getTime());
    date.setUTCDate(start.getUTCDate() + i);
    const key = date.toISOString().slice(0, 10);
    scheduleDays.push({
      date: key,
      classes: (classesByDay.get(key) ?? []).map(serializeClass),
    });
  }
  return { days: scheduleDays };
}
