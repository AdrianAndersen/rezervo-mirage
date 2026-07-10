import {
  createDocument,
  type ZodObjectInput,
  type ZodOpenApiObject,
  type ZodOpenApiOperationObject,
  type ZodOpenApiParameters,
  type ZodOpenApiPathsObject,
} from "zod-openapi";

import { allEndpoints } from "./endpoints";
import type { Endpoint } from "./handler";
import { apiErrorSchema } from "./schemas";

const API_VERSION = "1.0.0";

/**
 * `z.number().int()` (Zod v4) carries JS safe-integer bounds. They are an
 * artifact of the TS `number` type, not a real domain constraint, and generate
 * noisy `conint(ge=..., le=...)` constraints in the generated Python client.
 * Strip `minimum`/`maximum` wherever they equal the safe-integer limits.
 */
const SAFE_INTEGER_MAX = 9007199254740991;

function stripSafeIntegerBounds(node: unknown): void {
  if (Array.isArray(node)) {
    for (const item of node) {
      stripSafeIntegerBounds(item);
    }
    return;
  }
  if (node === null || typeof node !== "object") {
    return;
  }
  const schema = node as Record<string, unknown>;
  if (schema["minimum"] === -SAFE_INTEGER_MAX) {
    delete schema["minimum"];
  }
  if (schema["maximum"] === SAFE_INTEGER_MAX) {
    delete schema["maximum"];
  }
  for (const value of Object.values(schema)) {
    stripSafeIntegerBounds(value);
  }
}

function toOperation({ config }: Endpoint): ZodOpenApiOperationObject {
  const operation: ZodOpenApiOperationObject = {
    summary: config.summary,
    responses: {
      [String(config.successStatus ?? 200)]: config.response
        ? { description: "Success", content: { "application/json": { schema: config.response } } }
        : { description: "No content" },
      default: {
        description: "Error",
        content: { "application/json": { schema: apiErrorSchema } },
      },
    },
  };
  if (config.tags) {
    operation.tags = config.tags;
  }
  if (config.auth) {
    operation.security = [{ bearerAuth: [] }];
  }
  if (config.params || config.query) {
    // Endpoint configs widen params/query to `ZodType`; at runtime they are
    // always `z.object(...)`, which is what OpenAPI parameters require.
    const params: ZodOpenApiParameters = {};
    if (config.params) {
      params.path = config.params as ZodObjectInput;
    }
    if (config.query) {
      params.query = config.query as ZodObjectInput;
    }
    operation.requestParams = params;
  }
  if (config.body) {
    operation.requestBody = { content: { "application/json": { schema: config.body } } };
  }
  return operation;
}

/** Build the OpenAPI 3.1 document for the provider API from its endpoints. */
export function getOpenApiDocument(): ReturnType<typeof createDocument> {
  const paths: ZodOpenApiPathsObject = {};
  for (const endpoint of allEndpoints) {
    const method = endpoint.config.method.toLowerCase();
    paths[endpoint.config.path] = {
      ...paths[endpoint.config.path],
      [method]: toOperation(endpoint),
    };
  }

  const document: ZodOpenApiObject = {
    openapi: "3.1.0",
    info: {
      title: "rezervo-mirage provider API",
      version: API_VERSION,
      description: "A controllable fake gym provider that rezervo can book against.",
    },
    servers: [{ url: "/", description: "This deployment" }],
    paths,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "Access token returned by the login endpoint.",
        },
      },
    },
  };

  const generated = createDocument(document);
  stripSafeIntegerBounds(generated);
  return generated;
}
