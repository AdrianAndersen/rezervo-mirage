import { z } from "zod";

import { defineEndpoint, HttpError } from "../handler";
import { chainParamsSchema, chainProfileSchema, chainResponseSchema } from "../schemas";
import { serializeChainProfile, serializeChainResponse } from "../serialize";

export const listChainsEndpoint = defineEndpoint({
  method: "GET",
  path: "/api/chains",
  summary: "List all chains",
  tags: ["Chains"],
  response: z.array(chainProfileSchema),
  handler: async () => {
    const { listChains } = await import("../repository");
    const chains = await listChains();
    return chains.map(serializeChainProfile);
  },
});

export const chainEndpoint = defineEndpoint({
  method: "GET",
  path: "/api/chains/{chainIdentifier}",
  summary: "Get a chain with its branches and locations",
  tags: ["Chains"],
  params: chainParamsSchema,
  response: chainResponseSchema,
  handler: async ({ params }) => {
    const { findChainWithBranches } = await import("../repository");
    const chain = await findChainWithBranches(params.chainIdentifier);
    if (chain === null) {
      throw new HttpError(404, "Chain not found");
    }
    return serializeChainResponse(chain);
  },
});
