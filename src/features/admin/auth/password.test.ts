import { expect, test } from "vitest";

import { passwordMatches } from "./password";

test("accepts an exact match", () => {
  expect(passwordMatches("correct horse", "correct horse")).toBe(true);
});

test("rejects a wrong password of equal length", () => {
  expect(passwordMatches("correct-horse", "battery-staple")).toBe(false);
});

test("rejects a wrong password of different length", () => {
  expect(passwordMatches("short", "a much longer password")).toBe(false);
});

test("rejects when the expected password is empty", () => {
  expect(passwordMatches("anything", "")).toBe(false);
});

test("rejects an empty input", () => {
  expect(passwordMatches("", "secret")).toBe(false);
});
