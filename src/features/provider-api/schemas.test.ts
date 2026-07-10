import { expect, test } from "vitest";

import { loginRequestSchema, scheduleQuerySchema } from "./schemas";

test("loginRequestSchema accepts a valid body", () => {
  expect(loginRequestSchema.safeParse({ username: "kari", password: "secret" }).success).toBe(true);
});

test("loginRequestSchema rejects a missing password", () => {
  expect(loginRequestSchema.safeParse({ username: "kari" }).success).toBe(false);
});

test("scheduleQuerySchema coerces days from a string", () => {
  const parsed = scheduleQuerySchema.parse({ days: "14" });
  expect(parsed.days).toBe(14);
});

test("scheduleQuerySchema allows an empty query", () => {
  expect(scheduleQuerySchema.parse({})).toEqual({});
});
