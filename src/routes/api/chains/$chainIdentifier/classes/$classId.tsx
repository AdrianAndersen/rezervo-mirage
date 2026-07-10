import { createFileRoute } from "@tanstack/react-router";

import { classEndpoint } from "@/features/provider-api/endpoints";

export const Route = createFileRoute("/api/chains/$chainIdentifier/classes/$classId")({
  server: { handlers: { GET: classEndpoint.handler } },
});
