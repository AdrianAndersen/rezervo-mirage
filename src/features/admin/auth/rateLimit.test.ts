import { expect, test } from "vitest";

import { RateLimiter } from "./rateLimit";

test("allows attempts under the limit", () => {
  const limiter = new RateLimiter({ maxAttempts: 3, windowMs: 60_000 });
  const now = 0;
  expect(limiter.check("1.1.1.1", now).allowed).toBe(true);
  limiter.recordFailure("1.1.1.1", now);
  limiter.recordFailure("1.1.1.1", now);
  expect(limiter.check("1.1.1.1", now).allowed).toBe(true);
});

test("blocks once the limit is reached within the window", () => {
  const limiter = new RateLimiter({ maxAttempts: 3, windowMs: 60_000 });
  const now = 0;
  limiter.recordFailure("1.1.1.1", now);
  limiter.recordFailure("1.1.1.1", now);
  limiter.recordFailure("1.1.1.1", now);
  const result = limiter.check("1.1.1.1", now);
  expect(result.allowed).toBe(false);
  expect(result.retryAfterSeconds).toBeGreaterThan(0);
});

test("tracks each key independently", () => {
  const limiter = new RateLimiter({ maxAttempts: 1, windowMs: 60_000 });
  const now = 0;
  limiter.recordFailure("1.1.1.1", now);
  expect(limiter.check("1.1.1.1", now).allowed).toBe(false);
  expect(limiter.check("2.2.2.2", now).allowed).toBe(true);
});

test("forgets attempts once the window elapses", () => {
  const limiter = new RateLimiter({ maxAttempts: 1, windowMs: 60_000 });
  limiter.recordFailure("1.1.1.1", 0);
  expect(limiter.check("1.1.1.1", 30_000).allowed).toBe(false);
  expect(limiter.check("1.1.1.1", 60_001).allowed).toBe(true);
});

test("retryAfterSeconds counts down as the window elapses", () => {
  const limiter = new RateLimiter({ maxAttempts: 1, windowMs: 60_000 });
  limiter.recordFailure("1.1.1.1", 0);
  expect(limiter.check("1.1.1.1", 0).retryAfterSeconds).toBe(60);
  expect(limiter.check("1.1.1.1", 50_000).retryAfterSeconds).toBe(10);
});

test("reset clears a key's recorded attempts", () => {
  const limiter = new RateLimiter({ maxAttempts: 1, windowMs: 60_000 });
  limiter.recordFailure("1.1.1.1", 0);
  expect(limiter.check("1.1.1.1", 0).allowed).toBe(false);
  limiter.reset("1.1.1.1");
  expect(limiter.check("1.1.1.1", 0).allowed).toBe(true);
});
