import { createFileRoute } from "@tanstack/react-router";

import { createBookingEndpoint } from "@/features/provider-api/endpoints";

export const Route = createFileRoute("/api/chains/$chainIdentifier/bookings/")({
  server: { handlers: { POST: createBookingEndpoint.handler } },
});
