import { createFileRoute } from "@tanstack/react-router";

import { listChainsEndpoint } from "@/features/provider-api/endpoints";

export const Route = createFileRoute("/api/chains/")({
  server: { handlers: { GET: listChainsEndpoint.handler } },
});
