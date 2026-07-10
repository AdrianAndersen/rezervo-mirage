import { z } from "zod";

import { defineEndpoint, requireChain, requireUser } from "../handler";
import { chainParamsSchema, sessionSchema } from "../schemas";
import { serializeSession } from "../serialize";

export const sessionsEndpoint = defineEndpoint({
  method: "GET",
  path: "/api/chains/{chainIdentifier}/sessions",
  summary: "List the authenticated member's sessions",
  tags: ["Sessions"],
  auth: true,
  params: chainParamsSchema,
  response: z.array(sessionSchema),
  handler: async ({ params, request }) => {
    const chain = await requireChain(params.chainIdentifier);
    const userId = requireUser(request, chain.id);
    const { findUserRegistrations } = await import("../repository");
    const now = new Date();
    const registrations = await findUserRegistrations(userId);
    return registrations.map((registration) =>
      serializeSession(registration.class, registration, now),
    );
  },
});
