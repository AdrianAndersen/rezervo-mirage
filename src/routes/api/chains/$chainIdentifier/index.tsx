import { createFileRoute } from "@tanstack/react-router";

import { chainEndpoint } from "@/features/provider-api/endpoints";

export const Route = createFileRoute("/api/chains/$chainIdentifier/")({
  server: { handlers: { GET: chainEndpoint.handler } },
});
