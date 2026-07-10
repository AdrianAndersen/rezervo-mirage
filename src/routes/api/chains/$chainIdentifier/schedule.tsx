import { createFileRoute } from "@tanstack/react-router";

import { scheduleEndpoint } from "@/features/provider-api/endpoints";

export const Route = createFileRoute("/api/chains/$chainIdentifier/schedule")({
  server: { handlers: { GET: scheduleEndpoint.handler } },
});
