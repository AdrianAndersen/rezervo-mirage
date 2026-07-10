import { timingSafeEqual } from "node:crypto";

/**
 * Constant-time comparison of a submitted password against the expected one.
 * Uses {@link timingSafeEqual} so the check does not leak length or content via
 * timing. An empty expected password never matches (guards a misconfigured env).
 */
export function passwordMatches(input: string, expected: string): boolean {
  if (expected.length === 0) {
    return false;
  }
  const a = Buffer.from(input, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}
