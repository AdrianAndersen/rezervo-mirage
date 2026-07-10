import { z } from "zod";

/**
 * Zod schemas describing the provider API contract consumed by rezervo. These
 * are the single source of truth: request handlers validate against them, the
 * response types are inferred from them, and the OpenAPI document is generated
 * from them. `.meta({ id })` names a schema as a reusable OpenAPI component.
 */

const isoDateTime = z
  .string()
  .meta({ format: "date-time", examples: ["2026-07-10T08:00:00.000Z"] });

// Session state -------------------------------------------------------------

export const sessionStateSchema = z
  .enum(["CONFIRMED", "BOOKED", "WAITLIST", "NOSHOW", "UNKNOWN"])
  .meta({ id: "SessionState" });

// Chain ---------------------------------------------------------------------

export const chainProfileSchema = z
  .object({ identifier: z.string(), name: z.string() })
  .meta({ id: "ChainProfile" });

export const locationProfileSchema = z
  .object({ identifier: z.string(), name: z.string() })
  .meta({ id: "LocationProfile" });

export const branchProfileSchema = z
  .object({
    identifier: z.string(),
    name: z.string(),
    locations: z.array(locationProfileSchema),
  })
  .meta({ id: "BranchProfile" });

export const chainResponseSchema = z
  .object({ profile: chainProfileSchema, branches: z.array(branchProfileSchema) })
  .meta({ id: "ChainResponse" });

// Class ---------------------------------------------------------------------

export const activitySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    additionalInformation: z.string().nullable(),
    image: z.string().nullable(),
  })
  .meta({ id: "Activity" });

export const instructorSchema = z.object({ name: z.string() }).meta({ id: "Instructor" });

export const classLocationSchema = z
  .object({ identifier: z.string(), studio: z.string(), room: z.string().nullable() })
  .meta({ id: "ClassLocation" });

export const mirageClassSchema = z
  .object({
    id: z.string(),
    startTime: isoDateTime,
    endTime: isoDateTime,
    location: classLocationSchema,
    activity: activitySchema,
    instructors: z.array(instructorSchema),
    isBookable: z.boolean(),
    isCancelled: z.boolean(),
    cancelText: z.string().nullable(),
    totalSlots: z.number().int(),
    availableSlots: z.number().int(),
    waitingListCount: z.number().int(),
    bookingOpensAt: isoDateTime,
  })
  .meta({ id: "RezervoMirageClass" });

// Schedule ------------------------------------------------------------------

export const scheduleDaySchema = z
  .object({
    dayName: z.string(),
    date: z.string().meta({ format: "date", examples: ["2026-07-10"] }),
    classes: z.array(mirageClassSchema),
  })
  .meta({ id: "ScheduleDay" });

export const scheduleResponseSchema = z
  .object({ days: z.array(scheduleDaySchema) })
  .meta({ id: "ScheduleResponse" });

// Auth ----------------------------------------------------------------------

export const loginRequestSchema = z
  .object({ username: z.string(), password: z.string() })
  .meta({ id: "LoginRequest" });

export const loginResponseSchema = z
  .object({
    accessToken: z.string(),
    tokenType: z.literal("Bearer"),
    expiresIn: z.number().int(),
    userId: z.number().int(),
  })
  .meta({ id: "LoginResponse" });

// Sessions & bookings -------------------------------------------------------

export const sessionSchema = z
  .object({
    status: sessionStateSchema,
    positionInWaitList: z.number().int().nullable(),
    class: mirageClassSchema,
  })
  .meta({ id: "Session" });

export const createBookingRequestSchema = z
  .object({ classId: z.string() })
  .meta({ id: "CreateBookingRequest" });

export const bookingResultSchema = z
  .object({
    status: z.enum(["BOOKED", "WAITLIST"]),
    positionInWaitList: z.number().int().nullable(),
  })
  .meta({ id: "BookingResult" });

export const apiErrorSchema = z.object({ error: z.string() }).meta({ id: "ApiError" });

// Request parameters --------------------------------------------------------

export const chainParamsSchema = z.object({ chainIdentifier: z.string() });

export const classParamsSchema = z.object({
  chainIdentifier: z.string(),
  classId: z.string(),
});

export const scheduleQuerySchema = z.object({
  from: z.string().optional(),
  days: z.coerce.number().int().optional(),
  locations: z.string().optional(),
});

// Inferred contract types (the schema is the type) --------------------------

export type SessionState = z.infer<typeof sessionStateSchema>;
export type ChainProfile = z.infer<typeof chainProfileSchema>;
export type LocationProfile = z.infer<typeof locationProfileSchema>;
export type BranchProfile = z.infer<typeof branchProfileSchema>;
export type ChainResponse = z.infer<typeof chainResponseSchema>;
export type Activity = z.infer<typeof activitySchema>;
export type Instructor = z.infer<typeof instructorSchema>;
export type ClassLocation = z.infer<typeof classLocationSchema>;
export type RezervoMirageClass = z.infer<typeof mirageClassSchema>;
export type ScheduleDay = z.infer<typeof scheduleDaySchema>;
export type ScheduleResponse = z.infer<typeof scheduleResponseSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type CreateBookingRequest = z.infer<typeof createBookingRequestSchema>;
export type BookingResult = z.infer<typeof bookingResultSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;
