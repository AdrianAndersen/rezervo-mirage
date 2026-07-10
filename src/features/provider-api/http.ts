import type { ApiError } from "./types";

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorResponse(message: string, status: number): Response {
  const body: ApiError = { error: message };
  return json(body, status);
}

export const noContent = (): Response => new Response(null, { status: 204 });
