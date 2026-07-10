import { expect, test } from "vitest";

import { getOpenApiDocument } from "./openapi";

test("document includes the login path with a POST operation", () => {
  const doc = getOpenApiDocument();
  const login = doc.paths?.["/api/chains/{chainIdentifier}/auth/login"];
  expect(login?.post).toBeDefined();
});

test("document declares a bearer security scheme", () => {
  const doc = getOpenApiDocument();
  const scheme = doc.components?.securitySchemes?.["bearerAuth"];
  expect(scheme).toMatchObject({ type: "http", scheme: "bearer" });
});

test("authenticated endpoints require bearer auth", () => {
  const doc = getOpenApiDocument();
  const sessions = doc.paths?.["/api/chains/{chainIdentifier}/sessions"];
  expect(sessions?.get?.security).toEqual([{ bearerAuth: [] }]);
});

test("public endpoints do not require auth", () => {
  const doc = getOpenApiDocument();
  const chains = doc.paths?.["/api/chains"];
  expect(chains?.get?.security).toBeUndefined();
});

test("all eight endpoints are documented", () => {
  const doc = getOpenApiDocument();
  const operations = Object.values(doc.paths ?? {}).flatMap((item) =>
    ["get", "post", "delete"].filter((method) => method in (item as Record<string, unknown>)),
  );
  expect(operations).toHaveLength(8);
});
