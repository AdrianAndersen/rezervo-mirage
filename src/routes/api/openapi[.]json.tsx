import { createFileRoute } from "@tanstack/react-router";

import { getOpenApiDocument } from "@/features/provider-api/openapi";

export const Route = createFileRoute("/api/openapi.json")({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify(getOpenApiDocument()), {
          headers: { "Content-Type": "application/json" },
        }),
    },
  },
});
