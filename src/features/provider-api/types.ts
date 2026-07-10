/**
 * Provider API contract types. These are inferred from the Zod schemas in
 * `./schemas`, which are the single source of truth; this module re-exports them
 * so existing consumers keep a stable `./types` import path.
 */
export type {
  Activity,
  ApiError,
  BookingResult,
  BranchProfile,
  ChainProfile,
  ChainResponse,
  ClassLocation,
  CreateBookingRequest,
  Instructor,
  LocationProfile,
  LoginRequest,
  LoginResponse,
  RezervoMirageClass,
  ScheduleDay,
  ScheduleResponse,
  Session,
  SessionState,
} from "./schemas";
