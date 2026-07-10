import { createAccessToken } from "../auth";
import { defineEndpoint, HttpError, requireChain } from "../handler";
import { chainParamsSchema, loginRequestSchema, loginResponseSchema } from "../schemas";

export const loginEndpoint = defineEndpoint({
  method: "POST",
  path: "/api/chains/{chainIdentifier}/auth/login",
  summary: "Exchange username and password for an access token",
  tags: ["Auth"],
  params: chainParamsSchema,
  body: loginRequestSchema,
  response: loginResponseSchema,
  handler: async ({ params, body }) => {
    const chain = await requireChain(params.chainIdentifier);
    const { findMemberByUsername } = await import("../repository");
    const user = await findMemberByUsername(chain.id, body.username);
    if (user === null || user.password === null || user.password !== body.password) {
      throw new HttpError(401, "Invalid credentials");
    }
    const { token } = createAccessToken(user.id, chain.id);
    return { accessToken: token };
  },
});
