import { expect, test } from "vitest";
import { z } from "zod";

import { defineEndpoint, HttpError, requireUser } from "./handler";

function post(url: string, body?: unknown, headers?: Record<string, string>): Request {
  return new Request(url, {
    method: "POST",
    ...(body === undefined ? {} : { body: typeof body === "string" ? body : JSON.stringify(body) }),
    headers: { "Content-Type": "application/json", ...headers },
  });
}

const echo = defineEndpoint({
  method: "POST",
  path: "/echo",
  summary: "Echo the body back",
  body: z.object({ name: z.string() }),
  response: z.object({ name: z.string() }),
  handler: ({ body }) => ({ name: body.name }),
});

test("valid body is parsed and echoed with 200", async () => {
  const res = await echo.handler({ params: {}, request: post("http://x/echo", { name: "Kari" }) });
  expect(res.status).toBe(200);
  expect(await res.json()).toEqual({ name: "Kari" });
});

test("invalid JSON yields 400", async () => {
  const res = await echo.handler({ params: {}, request: post("http://x/echo", "{not json") });
  expect(res.status).toBe(400);
  expect((await res.json()).error).toBe("Invalid JSON body");
});

test("schema violation yields 400", async () => {
  const res = await echo.handler({ params: {}, request: post("http://x/echo", { name: 1 }) });
  expect(res.status).toBe(400);
});

test("requireUser without a bearer token yields 401", async () => {
  const guarded = defineEndpoint({
    method: "POST",
    path: "/guarded",
    summary: "Requires auth",
    auth: true,
    response: z.object({ ok: z.boolean() }),
    handler: ({ request }) => {
      requireUser(request, 1);
      return { ok: true };
    },
  });
  const res = await guarded.handler({ params: {}, request: post("http://x/guarded") });
  expect(res.status).toBe(401);
});

test("204 endpoints return an empty body", async () => {
  const remove = defineEndpoint({
    method: "DELETE",
    path: "/remove",
    summary: "Delete something",
    successStatus: 204,
    handler: () => noContentValue(),
  });
  const res = await remove.handler({
    params: {},
    request: new Request("http://x/remove", { method: "DELETE" }),
  });
  expect(res.status).toBe(204);
});

function noContentValue(): undefined {
  return undefined;
}

test("HttpError thrown in a handler maps to its status", async () => {
  const boom = defineEndpoint({
    method: "GET",
    path: "/boom",
    summary: "Throws",
    handler: () => {
      throw new HttpError(409, "Conflict");
    },
  });
  const res = await boom.handler({ params: {}, request: new Request("http://x/boom") });
  expect(res.status).toBe(409);
  expect((await res.json()).error).toBe("Conflict");
});
