import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { adminAuthMiddleware } from "@/features/admin/auth/middleware";
import { z } from "zod";

import { activityCreateSchema, activityUpdateSchema, idSchema } from "@/features/admin/schemas";
import { runRepo } from "@/features/admin/server/errors";
import { pruneUndefined } from "@/features/admin/server/prune";
import * as repo from "@/features/admin/repository";

export const activityKeys = {
  all: (chainId: number) => ["activities", chainId] as const,
};

export const listActivitiesFn = createServerFn()
  .middleware([adminAuthMiddleware])
  .validator(z.object({ chainId: z.number().int() }))
  .handler(({ data }) => runRepo(() => repo.listActivities(data.chainId)));

export const createActivityFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(activityCreateSchema)
  .handler(({ data }) => runRepo(() => repo.createActivity(data)));

export const updateActivityFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(idSchema.extend(activityUpdateSchema.shape))
  .handler(({ data: { id, ...rest } }) =>
    runRepo(() => repo.updateActivity(id, pruneUndefined(rest))),
  );

export const deleteActivityFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(idSchema)
  .handler(({ data }) => runRepo(() => repo.deleteActivity(data.id)));

export type Activity = Awaited<ReturnType<typeof listActivitiesFn>>[number];

export const activitiesQuery = (chainId: number) =>
  queryOptions({
    queryKey: activityKeys.all(chainId),
    queryFn: () => listActivitiesFn({ data: { chainId } }),
  });
