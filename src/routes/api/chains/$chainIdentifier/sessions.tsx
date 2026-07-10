import { createFileRoute } from "@tanstack/react-router";

import { sessionsEndpoint } from "@/features/provider-api/endpoints";

export const Route = createFileRoute("/api/chains/$chainIdentifier/sessions")({
  server: { handlers: { GET: sessionsEndpoint.handler } },
});
