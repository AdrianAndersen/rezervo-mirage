import { z } from "zod";

/** A required, non-empty (trimmed) string. */
const requiredText = z.string().trim().min(1, "Feltet må fylles ut");

/** An optional text field: absent/`null`/empty all normalize to `null`. */
const optionalText = z
  .string()
  .trim()
  .nullish()
  .transform((value) => (value == null || value === "" ? null : value));

/** Shared path-parameter shape for single-row functions (get/update/delete). */
export const idSchema = z.object({ id: z.number().int() });

/** Path-parameter shape for resolving a chain by its URL slug (identifier). */
export const chainSlugSchema = z.object({ identifier: requiredText });

// ---------------------------------------------------------------------------
// Chains
// ---------------------------------------------------------------------------

export const chainCreateSchema = z.object({
  identifier: requiredText,
  name: requiredText,
});
export const chainUpdateSchema = chainCreateSchema.partial();

export type ChainCreateInput = z.infer<typeof chainCreateSchema>;
export type ChainUpdateInput = z.infer<typeof chainUpdateSchema>;

// ---------------------------------------------------------------------------
// Branches
// ---------------------------------------------------------------------------

export const branchCreateSchema = z.object({
  chainId: z.number().int(),
  identifier: requiredText,
  name: requiredText,
});
export const branchUpdateSchema = z.object({
  identifier: requiredText.optional(),
  name: requiredText.optional(),
});

export type BranchCreateInput = z.infer<typeof branchCreateSchema>;
export type BranchUpdateInput = z.infer<typeof branchUpdateSchema>;

// ---------------------------------------------------------------------------
// Locations
// ---------------------------------------------------------------------------

export const locationCreateSchema = z.object({
  branchId: z.number().int(),
  identifier: requiredText,
  name: requiredText,
});
export const locationUpdateSchema = z.object({
  branchId: z.number().int().optional(),
  identifier: requiredText.optional(),
  name: requiredText.optional(),
});

export type LocationCreateInput = z.infer<typeof locationCreateSchema>;
export type LocationUpdateInput = z.infer<typeof locationUpdateSchema>;

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

export const activityCreateSchema = z.object({
  chainId: z.number().int(),
  name: requiredText,
  color: requiredText,
  description: optionalText,
  additionalInformation: optionalText,
  image: optionalText,
});
export const activityUpdateSchema = activityCreateSchema.omit({ chainId: true }).partial();

export type ActivityCreateInput = z.infer<typeof activityCreateSchema>;
export type ActivityUpdateInput = z.infer<typeof activityUpdateSchema>;

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const userCreateSchema = z.object({
  chainId: z.number().int(),
  name: requiredText,
  username: requiredText,
  password: requiredText,
  isEmployee: z.boolean().default(false),
});
export const userUpdateSchema = z.object({
  name: requiredText.optional(),
  username: requiredText.optional(),
  password: requiredText.optional(),
  isEmployee: z.boolean().optional(),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------

export const classCoreSchema = z.object({
  locationId: z.number().int(),
  activityId: z.number().int(),
  startTime: z.date(),
  endTime: z.date(),
  bookingOpensAt: z.date(),
  room: optionalText,
  totalSlots: z.number().int().min(0),
  isCancelled: z.boolean().default(false),
  cancelText: optionalText,
  instructorIds: z.number().int().array().default([]),
});
export const classCreateSchema = classCoreSchema.extend({
  repeatWeeks: z.number().int().min(1).default(1),
});
export const classUpdateSchema = classCoreSchema.partial();

export type ClassCoreInput = z.infer<typeof classCoreSchema>;
export type ClassCreateInput = z.infer<typeof classCreateSchema>;
export type ClassUpdateInput = z.infer<typeof classUpdateSchema>;

// ---------------------------------------------------------------------------
// Registrations
// ---------------------------------------------------------------------------

export const registrationsSchema = z.object({
  userIds: z.number().int().array().min(1),
});
export const randomRegistrationsSchema = z.object({
  count: z.number().int().min(1),
});

export type RegistrationsInput = z.infer<typeof registrationsSchema>;
export type RandomRegistrationsInput = z.infer<typeof randomRegistrationsSchema>;
