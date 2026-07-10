import { createFileRoute } from "@tanstack/react-router";

import { loginEndpoint } from "@/features/provider-api/endpoints";

export const Route = createFileRoute("/api/chains/$chainIdentifier/auth/login")({
  server: { handlers: { POST: loginEndpoint.handler } },
});
