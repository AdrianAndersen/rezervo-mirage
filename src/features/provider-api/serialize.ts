import type { Prisma } from "../../../generated/prisma/client";

import type {
  BranchProfile,
  ChainProfile,
  ChainResponse,
  RezervoMirageClass,
  Session,
  SessionState,
} from "./types";

/** A chain with its branches and their locations. */
export type ChainWithBranches = Prisma.ChainGetPayload<{
  include: { branches: { include: { locations: true } } };
}>;

/** A class with everything needed to serialize it, plus its registrations. */
export type ClassWithDetails = Prisma.ClassGetPayload<{
  include: {
    location: true;
    activity: true;
    instructors: true;
    registrations: true;
  };
}>;

export function serializeChainProfile(
  chain: Pick<ChainWithBranches, "identifier" | "name">,
): ChainProfile {
  return {
    identifier: chain.identifier,
    name: chain.name,
  };
}

export function serializeChainResponse(chain: ChainWithBranches): ChainResponse {
  const branches: BranchProfile[] = chain.branches.map((branch) => ({
    identifier: branch.identifier,
    name: branch.name,
    locations: branch.locations.map((location) => ({
      identifier: location.identifier,
      name: location.name,
    })),
  }));
  return {
    profile: serializeChainProfile(chain),
    branches,
  };
}

/**
 * Whether a class can be booked at `now`. Bookability is derived from time, not
 * stored: a class opens for booking once `bookingOpensAt` has passed and stays
 * open until it starts. This mirrors how rezervo computes `is_bookable` from
 * `bookingOpensAt`, so a booking rezervo considers valid is never rejected here.
 */
export function classBookableAt(
  cls: Pick<ClassWithDetails, "bookingOpensAt" | "startTime">,
  now: Date = new Date(),
): boolean {
  const nowMs = now.getTime();
  return cls.bookingOpensAt.getTime() <= nowMs && nowMs < cls.startTime.getTime();
}

/** Registrations sorted into booking order (earliest first). */
function bookingOrder(
  registrations: ClassWithDetails["registrations"],
): ClassWithDetails["registrations"] {
  return [...registrations].sort((a, b) => {
    const delta = a.createdAt.getTime() - b.createdAt.getTime();
    return delta !== 0 ? delta : a.id - b.id;
  });
}

export function serializeClass(cls: ClassWithDetails): RezervoMirageClass {
  const registrationCount = cls.registrations.length;
  const bookedCount = Math.min(registrationCount, cls.totalSlots);
  return {
    id: String(cls.id),
    startTime: cls.startTime.toISOString(),
    endTime: cls.endTime.toISOString(),
    location: {
      identifier: cls.location.identifier,
      studio: cls.location.name,
      room: cls.room,
    },
    activity: {
      id: String(cls.activity.id),
      name: cls.activity.name,
      description: cls.activity.description,
      additionalInformation: cls.activity.additionalInformation,
      image: cls.activity.image,
    },
    instructors: cls.instructors.map((instructor) => ({
      name: instructor.name,
    })),
    isCancelled: cls.isCancelled,
    cancelText: cls.cancelText,
    totalSlots: cls.totalSlots,
    availableSlots: Math.max(0, cls.totalSlots - bookedCount),
    waitingListCount: Math.max(0, registrationCount - cls.totalSlots),
    bookingOpensAt: cls.bookingOpensAt.toISOString(),
  };
}

/**
 * 1-based rank of a registration within its class's booking order. Rank 1 is the
 * first to book. Ranks up to `totalSlots` hold a confirmed spot; beyond that is
 * the waiting list.
 */
export function registrationRank(cls: ClassWithDetails, registrationId: number): number {
  const ordered = bookingOrder(cls.registrations);
  return ordered.findIndex((r) => r.id === registrationId) + 1;
}

/**
 * Derive a session's state and waiting-list position for a given registration.
 *
 *  - CONFIRMED: the member has checked in.
 *  - NOSHOW:    the class has started and the member never checked in.
 *  - BOOKED:    an upcoming class with a confirmed spot.
 *  - WAITLIST:  an upcoming class where the member is on the waiting list.
 */
export function deriveSessionState(
  cls: ClassWithDetails,
  registration: ClassWithDetails["registrations"][number],
  now: Date = new Date(),
): { status: SessionState; positionInWaitList: number | null } {
  if (registration.checkedInAt !== null) {
    return { status: "CONFIRMED", positionInWaitList: null };
  }
  const rank = registrationRank(cls, registration.id);
  const onWaitingList = rank > cls.totalSlots;
  const positionInWaitList = onWaitingList ? rank - cls.totalSlots : null;
  if (cls.startTime.getTime() < now.getTime()) {
    return { status: "NOSHOW", positionInWaitList };
  }
  return {
    status: onWaitingList ? "WAITLIST" : "BOOKED",
    positionInWaitList,
  };
}

export function serializeSession(
  cls: ClassWithDetails,
  registration: ClassWithDetails["registrations"][number],
  now: Date = new Date(),
): Session {
  const { status, positionInWaitList } = deriveSessionState(cls, registration, now);
  return {
    status,
    positionInWaitList,
    class: serializeClass(cls),
  };
}
