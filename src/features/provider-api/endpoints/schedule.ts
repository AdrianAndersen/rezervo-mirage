import { defineEndpoint, requireChain } from "../handler";
import {
  buildScheduleResponse,
  DEFAULT_SCHEDULE_DAYS,
  MAX_SCHEDULE_DAYS,
  startOfUtcDay,
} from "../schedule";
import { chainParamsSchema, scheduleQuerySchema, scheduleResponseSchema } from "../schemas";

/** Start of the requested window; today (UTC) when absent or unparseable. */
function parseFrom(raw: string | undefined): Date {
  if (raw === undefined) {
    return startOfUtcDay(new Date());
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? startOfUtcDay(new Date()) : startOfUtcDay(parsed);
}

/** Clamp the requested day count into `[1, MAX_SCHEDULE_DAYS]`. */
function clampDays(raw: number | undefined): number {
  if (raw === undefined || raw < 1) {
    return DEFAULT_SCHEDULE_DAYS;
  }
  return Math.min(raw, MAX_SCHEDULE_DAYS);
}

export const scheduleEndpoint = defineEndpoint({
  method: "GET",
  path: "/api/chains/{chainIdentifier}/schedule",
  summary: "Get the class schedule for a window of days",
  tags: ["Schedule"],
  params: chainParamsSchema,
  query: scheduleQuerySchema,
  response: scheduleResponseSchema,
  handler: async ({ params, query }) => {
    const chain = await requireChain(params.chainIdentifier);
    const from = parseFrom(query.from);
    const days = clampDays(query.days);
    const locationIdentifiers =
      query.locations !== undefined && query.locations.length > 0
        ? query.locations.split(",").map((value) => value.trim())
        : null;

    const to = new Date(from.getTime());
    to.setUTCDate(from.getUTCDate() + days);

    const { findScheduleClasses } = await import("../repository");
    const classes = await findScheduleClasses(chain.id, from, to, locationIdentifiers);
    return buildScheduleResponse(from, days, classes);
  },
});
