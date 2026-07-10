import { expect, test } from "vitest";

import { runRepo, toFriendlyError } from "./errors";

test("maps P2002 to Norwegian unique message", () => {
  expect(toFriendlyError({ code: "P2002" }).message).toContain("finnes allerede");
});

test("maps P2025 to not-found message", () => {
  expect(toFriendlyError({ code: "P2025" }).message).toContain("Fant ikke");
});

test("passes unknown Error instances through unchanged", () => {
  const original = new Error("boom");
  expect(toFriendlyError(original)).toBe(original);
});

test("runRepo rethrows mapped errors", async () => {
  await expect(runRepo(() => Promise.reject({ code: "P2002" }))).rejects.toThrow("finnes allerede");
});
