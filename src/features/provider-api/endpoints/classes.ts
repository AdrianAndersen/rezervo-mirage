import { defineEndpoint, HttpError, requireChain } from "../handler";
import { classParamsSchema, mirageClassSchema } from "../schemas";
import { serializeClass } from "../serialize";

export const classEndpoint = defineEndpoint({
  method: "GET",
  path: "/api/chains/{chainIdentifier}/classes/{classId}",
  summary: "Get a single class by id",
  tags: ["Classes"],
  params: classParamsSchema,
  response: mirageClassSchema,
  handler: async ({ params }) => {
    const chain = await requireChain(params.chainIdentifier);
    const classId = Number.parseInt(params.classId, 10);
    if (Number.isNaN(classId)) {
      throw new HttpError(400, "Invalid class id");
    }
    const { findClassInChain } = await import("../repository");
    const cls = await findClassInChain(chain.id, classId);
    if (cls === null) {
      throw new HttpError(404, "Class not found");
    }
    return serializeClass(cls);
  },
});
