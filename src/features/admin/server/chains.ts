import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { adminAuthMiddleware } from "@/features/admin/auth/middleware";

import { chainCreateSchema, chainUpdateSchema, idSchema } from "@/features/admin/schemas";
import { runRepo } from "@/features/admin/server/errors";
import { pruneUndefined } from "@/features/admin/server/prune";
import * as repo from "@/features/admin/repository";

export const chainKeys = {
  all: ["chains"] as const,
  detail: (id: number) => ["chains", id] as const,
};

export const listChainsFn = createServerFn()
  .middleware([adminAuthMiddleware])
  .handler(() => runRepo(() => repo.listChains()));

export const getChainFn = createServerFn()
  .middleware([adminAuthMiddleware])
  .validator(idSchema)
  .handler(({ data }) => runRepo(() => repo.getChain(data.id)));

export const createChainFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(chainCreateSchema)
  .handler(({ data }) => runRepo(() => repo.createChain(data)));

export const updateChainFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(idSchema.extend(chainUpdateSchema.shape))
  .handler(({ data: { id, ...rest } }) =>
    runRepo(() => repo.updateChain(id, pruneUndefined(rest))),
  );

export const deleteChainFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(idSchema)
  .handler(({ data }) => runRepo(() => repo.deleteChain(data.id)));

export type Chain = Awaited<ReturnType<typeof listChainsFn>>[number];

export const chainsQuery = () =>
  queryOptions({ queryKey: chainKeys.all, queryFn: () => listChainsFn() });

export const chainQuery = (id: number) =>
  queryOptions({ queryKey: chainKeys.detail(id), queryFn: () => getChainFn({ data: { id } }) });
