import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { adminAuthMiddleware } from "@/features/admin/auth/middleware";
import { z } from "zod";

import { branchCreateSchema, branchUpdateSchema, idSchema } from "@/features/admin/schemas";
import { runRepo } from "@/features/admin/server/errors";
import { pruneUndefined } from "@/features/admin/server/prune";
import * as repo from "@/features/admin/repository";

export const branchKeys = {
  all: (chainId: number) => ["branches", chainId] as const,
};

export const listBranchesFn = createServerFn()
  .middleware([adminAuthMiddleware])
  .validator(z.object({ chainId: z.number().int() }))
  .handler(({ data }) => runRepo(() => repo.listBranches(data.chainId)));

export const createBranchFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(branchCreateSchema)
  .handler(({ data }) => runRepo(() => repo.createBranch(data)));

export const updateBranchFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(idSchema.extend(branchUpdateSchema.shape))
  .handler(({ data: { id, ...rest } }) =>
    runRepo(() => repo.updateBranch(id, pruneUndefined(rest))),
  );

export const deleteBranchFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(idSchema)
  .handler(({ data }) => runRepo(() => repo.deleteBranch(data.id)));

export type Branch = Awaited<ReturnType<typeof listBranchesFn>>[number];

export const branchesQuery = (chainId: number) =>
  queryOptions({
    queryKey: branchKeys.all(chainId),
    queryFn: () => listBranchesFn({ data: { chainId } }),
  });
