import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { adminAuthMiddleware } from "@/features/admin/auth/middleware";
import { z } from "zod";

import {
  classCreateSchema,
  classUpdateSchema,
  idSchema,
  randomRegistrationsSchema,
  registrationsSchema,
} from "@/features/admin/schemas";
import { runRepo } from "@/features/admin/server/errors";
import { pruneUndefined } from "@/features/admin/server/prune";
import * as repo from "@/features/admin/repository";

export const classKeys = {
  /** Prefix matching every class-list query. */
  all: ["classes"] as const,
  list: (chainId: number, from: string, to: string) => ["classes", chainId, from, to] as const,
  detail: (id: number) => ["class", id] as const,
};

export const listClassesFn = createServerFn()
  .middleware([adminAuthMiddleware])
  .validator(
    z.object({
      chainId: z.number().int(),
      from: z.date(),
      to: z.date(),
      locationId: z.number().int().nullish(),
    }),
  )
  .handler(({ data }) =>
    runRepo(() =>
      repo.listClasses({
        chainId: data.chainId,
        locationId: data.locationId ?? null,
        from: data.from,
        to: data.to,
      }),
    ),
  );

export const getClassFn = createServerFn()
  .middleware([adminAuthMiddleware])
  .validator(idSchema)
  .handler(({ data }) => runRepo(() => repo.getClass(data.id)));

export const createClassesFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(classCreateSchema)
  .handler(({ data: { repeatWeeks, ...core } }) =>
    runRepo(() => repo.createClasses(core, repeatWeeks)),
  );

export const updateClassFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(idSchema.extend(classUpdateSchema.shape))
  .handler(({ data: { id, ...rest } }) =>
    runRepo(() => repo.updateClass(id, pruneUndefined(rest))),
  );

export const deleteClassFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(idSchema)
  .handler(({ data }) => runRepo(() => repo.deleteClass(data.id)));

// Registrations ------------------------------------------------------------

export const addRegistrationsFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(z.object({ classId: z.number().int() }).extend(registrationsSchema.shape))
  .handler(({ data }) => runRepo(() => repo.addRegistrations(data.classId, data.userIds)));

export const addRandomRegistrationsFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(z.object({ classId: z.number().int() }).extend(randomRegistrationsSchema.shape))
  .handler(async ({ data }) => {
    const result = await runRepo(() => repo.addRandomRegistrations(data.classId, data.count));
    if (result === null) {
      throw new Error("Fant ikke timen");
    }
    return result;
  });

export const deleteRegistrationFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(z.object({ classId: z.number().int(), userId: z.number().int() }))
  .handler(({ data }) => runRepo(() => repo.deleteRegistration(data.classId, data.userId)));

export const setRegistrationAttendanceFn = createServerFn({ method: "POST" })
  .middleware([adminAuthMiddleware])
  .validator(
    z.object({ classId: z.number().int(), userId: z.number().int(), attended: z.boolean() }),
  )
  .handler(({ data }) =>
    runRepo(() => repo.setRegistrationAttendance(data.classId, data.userId, data.attended)),
  );

export type ClassListItem = Awaited<ReturnType<typeof listClassesFn>>[number];
export type ClassDetail = NonNullable<Awaited<ReturnType<typeof getClassFn>>>;
export type Registration = ClassDetail["registrations"][number];

export const classesQuery = (chainId: number, from: Date, to: Date) =>
  queryOptions({
    queryKey: classKeys.list(chainId, from.toISOString(), to.toISOString()),
    queryFn: () => listClassesFn({ data: { chainId, from, to } }),
  });

export const classQuery = (id: number | null) =>
  queryOptions({
    queryKey: classKeys.detail(id ?? -1),
    queryFn: () => getClassFn({ data: { id: id ?? -1 } }),
    enabled: id !== null,
  });
