import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { adminAuthMiddleware } from "@/features/admin/auth/middleware";
import { z } from "zod";

import { idSchema, userCreateSchema, userUpdateSchema } from "@/features/admin/schemas";
import { runRepo } from "@/features/admin/server/errors";
import { pruneUndefined } from "@/features/admin/server/prune";
import * as repo from "@/features/admin/repository";

export const userKeys = {
  /** Prefix matching every users query for a chain (any `employeesOnly`). */
  all: (chainId: number) => ["users", chainId] as const,
  list: (chainId: number, employeesOnly: boolean) => ["users", chainId, employeesOnly] as const,
};

export const listUsersFn = createServerFn()
  .middleware([adminAuthMiddleware])
  .validator(z.object({ chainId: z.number().int(), employeesOnly: z.boolean().default(false) }))
  .handler(({ data }) =>
    runRepo(() => repo.listUsers({ chainId: data.chainId, employeesOnly: data.employeesOnly })),
  );

export const createUserFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(userCreateSchema)
  .handler(({ data }) => runRepo(() => repo.createUser(data)));

export const updateUserFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(idSchema.extend(userUpdateSchema.shape))
  .handler(({ data: { id, ...rest } }) => runRepo(() => repo.updateUser(id, pruneUndefined(rest))));

export const deleteUserFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(idSchema)
  .handler(({ data }) => runRepo(() => repo.deleteUser(data.id)));

export type User = Awaited<ReturnType<typeof listUsersFn>>[number];

export const usersQuery = (chainId: number, employeesOnly = false) =>
  queryOptions({
    queryKey: userKeys.list(chainId, employeesOnly),
    queryFn: () => listUsersFn({ data: { chainId, employeesOnly } }),
  });
