import { expect, test } from "vitest";

import {
  activityCreateSchema,
  chainCreateSchema,
  classCreateSchema,
  userCreateSchema,
} from "./schemas";

test("chainCreateSchema rejects empty name", () => {
  expect(chainCreateSchema.safeParse({ identifier: "x", name: "" }).success).toBe(false);
});

test("classCreateSchema defaults repeatWeeks and instructorIds", () => {
  const parsed = classCreateSchema.parse({
    locationId: 1,
    activityId: 1,
    startTime: new Date("2026-07-10T10:00:00Z"),
    endTime: new Date("2026-07-10T11:00:00Z"),
    bookingOpensAt: new Date("2026-07-09T10:00:00Z"),
    totalSlots: 10,
  });
  expect(parsed.startTime).toBeInstanceOf(Date);
  expect(parsed.repeatWeeks).toBe(1);
  expect(parsed.instructorIds).toEqual([]);
});

test("classCreateSchema rejects non-Date startTime", () => {
  expect(
    classCreateSchema.safeParse({
      locationId: 1,
      activityId: 1,
      startTime: "2026-07-10T10:00:00Z",
      endTime: new Date(),
      bookingOpensAt: new Date(),
      totalSlots: 10,
    }).success,
  ).toBe(false);
});

test("userCreateSchema requires username and password", () => {
  expect(
    userCreateSchema.safeParse({ chainId: 1, name: "A", username: "", password: "x" }).success,
  ).toBe(false);
});

test("activityCreateSchema normalizes empty optional text to null", () => {
  const parsed = activityCreateSchema.parse({
    chainId: 1,
    name: "Yoga",
    color: "#0a0",
    description: "",
  });
  expect(parsed.description).toBeNull();
  expect(parsed.additionalInformation).toBeNull();
});
