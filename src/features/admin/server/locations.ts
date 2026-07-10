import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { adminAuthMiddleware } from "@/features/admin/auth/middleware";
import { z } from "zod";

import { idSchema, locationCreateSchema, locationUpdateSchema } from "@/features/admin/schemas";
import { runRepo } from "@/features/admin/server/errors";
import { pruneUndefined } from "@/features/admin/server/prune";
import * as repo from "@/features/admin/repository";

export const locationKeys = {
  all: (chainId: number) => ["locations", chainId] as const,
};

export const listLocationsFn = createServerFn()
  .middleware([adminAuthMiddleware])
  .validator(z.object({ chainId: z.number().int(), branchId: z.number().int().nullish() }))
  .handler(({ data }) =>
    runRepo(() => repo.listLocations({ chainId: data.chainId, branchId: data.branchId ?? null })),
  );

export const createLocationFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(locationCreateSchema)
  .handler(({ data }) => runRepo(() => repo.createLocation(data)));

export const updateLocationFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(idSchema.extend(locationUpdateSchema.shape))
  .handler(({ data: { id, ...rest } }) =>
    runRepo(() => repo.updateLocation(id, pruneUndefined(rest))),
  );

export const deleteLocationFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(idSchema)
  .handler(({ data }) => runRepo(() => repo.deleteLocation(data.id)));

export type Location = Awaited<ReturnType<typeof listLocationsFn>>[number];

export const locationsQuery = (chainId: number) =>
  queryOptions({
    queryKey: locationKeys.all(chainId),
    queryFn: () => listLocationsFn({ data: { chainId } }),
  });
