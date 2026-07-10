import type { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../server/db";

// ---------------------------------------------------------------------------
// Chains
// ---------------------------------------------------------------------------

export function listChains() {
  return prisma.chain.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { branches: true, activities: true, users: true } },
    },
  });
}

export function getChain(id: number) {
  return prisma.chain.findUnique({ where: { id } });
}

export function createChain(data: { identifier: string; name: string }) {
  return prisma.chain.create({ data });
}

export function updateChain(id: number, data: { identifier?: string; name?: string }) {
  return prisma.chain.update({ where: { id }, data });
}

export function deleteChain(id: number) {
  return prisma.chain.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Branches
// ---------------------------------------------------------------------------

export function listBranches(chainId: number | null) {
  return prisma.branch.findMany({
    where: chainId !== null ? { chainId } : {},
    orderBy: { name: "asc" },
    include: { _count: { select: { locations: true } } },
  });
}

export function createBranch(data: { chainId: number; identifier: string; name: string }) {
  return prisma.branch.create({ data });
}

export function updateBranch(id: number, data: { identifier?: string; name?: string }) {
  return prisma.branch.update({ where: { id }, data });
}

export function deleteBranch(id: number) {
  return prisma.branch.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Locations
// ---------------------------------------------------------------------------

export function listLocations(filters: { chainId: number | null; branchId: number | null }) {
  return prisma.location.findMany({
    where: {
      ...(filters.branchId !== null ? { branchId: filters.branchId } : {}),
      ...(filters.chainId !== null ? { branch: { chainId: filters.chainId } } : {}),
    },
    orderBy: { name: "asc" },
    include: { branch: { select: { id: true, name: true } } },
  });
}

export function createLocation(data: { branchId: number; identifier: string; name: string }) {
  return prisma.location.create({ data });
}

export function updateLocation(
  id: number,
  data: { identifier?: string; name?: string; branchId?: number },
) {
  return prisma.location.update({ where: { id }, data });
}

export function deleteLocation(id: number) {
  return prisma.location.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

export function listActivities(chainId: number | null) {
  return prisma.activity.findMany({
    where: chainId !== null ? { chainId } : {},
    orderBy: { name: "asc" },
  });
}

export type ActivityInput = {
  name: string;
  color: string;
  description?: string | null;
  additionalInformation?: string | null;
  image?: string | null;
};

export function createActivity(data: ActivityInput & { chainId: number }) {
  return prisma.activity.create({ data });
}

export function updateActivity(id: number, data: Partial<ActivityInput>) {
  return prisma.activity.update({ where: { id }, data });
}

export function deleteActivity(id: number) {
  return prisma.activity.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export function listUsers(filters: { chainId: number | null; employeesOnly: boolean }) {
  return prisma.user.findMany({
    where: {
      ...(filters.chainId !== null ? { chainId: filters.chainId } : {}),
      ...(filters.employeesOnly ? { isEmployee: true } : {}),
    },
    orderBy: { name: "asc" },
  });
}

export type UserInput = {
  name: string;
  username: string;
  password: string;
  isEmployee?: boolean;
};

export function createUser(data: UserInput & { chainId: number }) {
  return prisma.user.create({ data });
}

export function updateUser(id: number, data: Partial<UserInput>) {
  return prisma.user.update({ where: { id }, data });
}

export function deleteUser(id: number) {
  return prisma.user.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

const classListInclude = {
  activity: true,
  location: { include: { branch: { select: { id: true, name: true } } } },
  instructors: { select: { id: true, name: true } },
  _count: { select: { registrations: true } },
} satisfies Prisma.ClassInclude;

const classDetailInclude = {
  activity: true,
  location: { include: { branch: { select: { id: true, name: true } } } },
  instructors: { select: { id: true, name: true, isEmployee: true } },
  registrations: {
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, name: true } } },
  },
} satisfies Prisma.ClassInclude;

export function listClasses(filters: {
  chainId: number | null;
  locationId: number | null;
  from: Date | null;
  to: Date | null;
}) {
  return prisma.class.findMany({
    where: {
      ...(filters.locationId !== null ? { locationId: filters.locationId } : {}),
      ...(filters.chainId !== null ? { location: { branch: { chainId: filters.chainId } } } : {}),
      ...(filters.from !== null || filters.to !== null
        ? {
            startTime: {
              ...(filters.from !== null ? { gte: filters.from } : {}),
              ...(filters.to !== null ? { lt: filters.to } : {}),
            },
          }
        : {}),
    },
    orderBy: { startTime: "asc" },
    include: classListInclude,
  });
}

export function getClass(id: number) {
  return prisma.class.findUnique({
    where: { id },
    include: classDetailInclude,
  });
}

export type ClassInput = {
  locationId: number;
  activityId: number;
  startTime: Date;
  endTime: Date;
  bookingOpensAt: Date;
  room?: string | null;
  totalSlots: number;
  isCancelled: boolean;
  cancelText?: string | null;
  instructorIds: number[];
};

function shiftWeeks(date: Date, weeks: number): Date {
  const shifted = new Date(date.getTime());
  shifted.setUTCDate(shifted.getUTCDate() + weeks * 7);
  return shifted;
}

/** Create a class, plus a weekly copy for each additional week (`weeks` total). */
export function createClasses(input: ClassInput, weeks: number) {
  const count = Math.max(1, weeks);
  return prisma.$transaction(
    Array.from({ length: count }, (_, week) =>
      prisma.class.create({
        data: {
          locationId: input.locationId,
          activityId: input.activityId,
          startTime: shiftWeeks(input.startTime, week),
          endTime: shiftWeeks(input.endTime, week),
          bookingOpensAt: shiftWeeks(input.bookingOpensAt, week),
          room: input.room ?? null,
          totalSlots: input.totalSlots,
          isCancelled: input.isCancelled,
          cancelText: input.cancelText ?? null,
          instructors: { connect: input.instructorIds.map((id) => ({ id })) },
        },
        include: classListInclude,
      }),
    ),
  );
}

export function updateClass(id: number, input: Partial<ClassInput>) {
  const { instructorIds, ...rest } = input;
  return prisma.class.update({
    where: { id },
    data: {
      ...rest,
      ...(instructorIds !== undefined
        ? { instructors: { set: instructorIds.map((i) => ({ id: i })) } }
        : {}),
    },
    include: classDetailInclude,
  });
}

export function deleteClass(id: number) {
  return prisma.class.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Registrations
// ---------------------------------------------------------------------------

export function listRegistrations(classId: number) {
  return prisma.registration.findMany({
    where: { classId },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, name: true } } },
  });
}

export async function addRegistrations(classId: number, userIds: number[]) {
  await prisma.registration.createMany({
    data: userIds.map((userId) => ({ classId, userId })),
    skipDuplicates: true,
  });
  return listRegistrations(classId);
}

/** Add up to `count` random chain members who are not already registered. */
export async function addRandomRegistrations(classId: number, count: number) {
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { location: { select: { branch: { select: { chainId: true } } } } },
  });
  if (cls === null) {
    return null;
  }
  const chainId = cls.location.branch.chainId;
  const candidates = await prisma.user.findMany({
    where: { chainId, registrations: { none: { classId } } },
    select: { id: true },
  });
  const shuffled = candidates
    .map((c) => c.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.max(0, count));
  return addRegistrations(classId, shuffled);
}

export async function deleteRegistration(classId: number, userId: number) {
  const result = await prisma.registration.deleteMany({
    where: { classId, userId },
  });
  return result.count > 0;
}

/** Set or clear a registration's check-in, driving the derived CONFIRMED/NOSHOW state. */
export async function setRegistrationAttendance(
  classId: number,
  userId: number,
  attended: boolean,
) {
  const result = await prisma.registration.updateMany({
    where: { classId, userId },
    data: { checkedInAt: attended ? new Date() : null },
  });
  return result.count > 0;
}
