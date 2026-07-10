import { prisma } from "../../server/db";
import type { ChainWithBranches, ClassWithDetails } from "./serialize";

const classInclude = {
  location: true,
  activity: true,
  instructors: true,
  registrations: true,
} as const;

export function findChainByIdentifier(identifier: string) {
  return prisma.chain.findUnique({ where: { identifier } });
}

export function findChainWithBranches(identifier: string): Promise<ChainWithBranches | null> {
  return prisma.chain.findUnique({
    where: { identifier },
    include: { branches: { include: { locations: true } } },
  });
}

export function listChains() {
  return prisma.chain.findMany({ orderBy: { identifier: "asc" } });
}

export function findMemberByUsername(chainId: number, username: string) {
  return prisma.user.findFirst({ where: { chainId, username } });
}

export function findClassInChain(
  chainId: number,
  classId: number,
): Promise<ClassWithDetails | null> {
  return prisma.class.findFirst({
    where: { id: classId, location: { branch: { chainId } } },
    include: classInclude,
  });
}

export function findScheduleClasses(
  chainId: number,
  from: Date,
  to: Date,
  locationIdentifiers: string[] | null,
): Promise<ClassWithDetails[]> {
  return prisma.class.findMany({
    where: {
      startTime: { gte: from, lt: to },
      location: {
        branch: { chainId },
        ...(locationIdentifiers !== null ? { identifier: { in: locationIdentifiers } } : {}),
      },
    },
    include: classInclude,
    orderBy: { startTime: "asc" },
  });
}

export function findUserRegistrations(userId: number) {
  return prisma.registration.findMany({
    where: { userId },
    include: { class: { include: classInclude } },
  });
}

export async function createBooking(
  userId: number,
  cls: ClassWithDetails,
): Promise<{ cls: ClassWithDetails; registrationId: number }> {
  const registration = await prisma.registration.upsert({
    where: { userId_classId: { userId, classId: cls.id } },
    create: { userId, classId: cls.id },
    update: {},
  });
  const refreshed = await prisma.class.findUniqueOrThrow({
    where: { id: cls.id },
    include: classInclude,
  });
  return { cls: refreshed, registrationId: registration.id };
}

export async function deleteBooking(userId: number, classId: number): Promise<boolean> {
  const result = await prisma.registration.deleteMany({
    where: { userId, classId },
  });
  return result.count > 0;
}
