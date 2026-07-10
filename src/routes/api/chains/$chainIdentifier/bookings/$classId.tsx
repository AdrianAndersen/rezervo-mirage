import { createFileRoute } from "@tanstack/react-router";

import { deleteBookingEndpoint } from "@/features/provider-api/endpoints";

export const Route = createFileRoute("/api/chains/$chainIdentifier/bookings/$classId")({
  server: { handlers: { DELETE: deleteBookingEndpoint.handler } },
});
