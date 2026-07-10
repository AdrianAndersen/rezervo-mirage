import { z } from "zod";

import { authenticateRequest } from "./auth";
import { errorResponse, json, noContent } from "./http";

/** An error carrying an HTTP status; caught by {@link defineEndpoint}. */
export class HttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type ProviderChain = NonNullable<
  Awaited<ReturnType<typeof import("./repository").findChainByIdentifier>>
>;

/**
 * Resolve a chain by identifier or throw a 404. The repository (and its Prisma
 * client) is imported lazily so this module stays free of a database at load.
 */
export async function requireChain(identifier: string): Promise<ProviderChain> {
  const { findChainByIdentifier } = await import("./repository");
  const chain = await findChainByIdentifier(identifier);
  if (chain === null) {
    throw new HttpError(404, "Chain not found");
  }
  return chain;
}

/** Authenticate the bearer token against a chain or throw a 401. */
export function requireUser(request: Request, chainId: number): number {
  const userId = authenticateRequest(request, chainId);
  if (userId === null) {
    throw new HttpError(401, "Unauthorized");
  }
  return userId;
}

type Infer<T> = T extends z.ZodType ? z.infer<T> : undefined;

export interface EndpointConfig<
  P extends z.ZodType | undefined = z.ZodType | undefined,
  Q extends z.ZodType | undefined = z.ZodType | undefined,
  B extends z.ZodType | undefined = z.ZodType | undefined,
  R extends z.ZodType | undefined = z.ZodType | undefined,
> {
  method: "GET" | "POST" | "DELETE";
  /** OpenAPI path template, e.g. `/api/chains/{chainIdentifier}/schedule`. */
  path: string;
  summary: string;
  tags?: string[];
  /** Marks the endpoint as requiring bearer auth (for the OpenAPI document). */
  auth?: boolean;
  params?: P;
  query?: Q;
  body?: B;
  /** HTTP status on success (default 200). Use 204 for an empty response. */
  successStatus?: number;
  /** Success response schema; omit for 204. */
  response?: R;
  handler: (ctx: {
    params: Infer<P>;
    query: Infer<Q>;
    body: Infer<B>;
    request: Request;
  }) => Promise<Infer<R> | Response> | Infer<R> | Response;
}

/** The runtime shape a TanStack file route mounts under `server.handlers`. */
export interface Endpoint {
  config: EndpointConfig;
  handler: (ctx: { params: Record<string, string>; request: Request }) => Promise<Response>;
}

function zodMessage(error: z.ZodError): string {
  const message = error.issues.map((issue) => issue.message).join(", ");
  return message.length > 0 ? message : "Invalid request";
}

/**
 * Turn a declarative endpoint definition into a validated TanStack route
 * handler. Validates params/query/body against their schemas, serializes the
 * returned value, and maps {@link HttpError} and Zod errors to `{ error }`
 * responses. The same config feeds the generated OpenAPI document.
 */
export function defineEndpoint<
  P extends z.ZodType | undefined = undefined,
  Q extends z.ZodType | undefined = undefined,
  B extends z.ZodType | undefined = undefined,
  R extends z.ZodType | undefined = undefined,
>(config: EndpointConfig<P, Q, B, R>): Endpoint {
  const handler = async (ctx: {
    params: Record<string, string>;
    request: Request;
  }): Promise<Response> => {
    try {
      const params = config.params ? config.params.parse(ctx.params) : undefined;
      const query = config.query
        ? config.query.parse(Object.fromEntries(new URL(ctx.request.url).searchParams))
        : undefined;

      let body: unknown;
      if (config.body) {
        let raw: unknown;
        try {
          raw = await ctx.request.json();
        } catch {
          throw new HttpError(400, "Invalid JSON body");
        }
        body = config.body.parse(raw);
      }

      const result = await config.handler({
        params: params as Infer<P>,
        query: query as Infer<Q>,
        body: body as Infer<B>,
        request: ctx.request,
      });

      if (result instanceof Response) {
        return result;
      }
      const status = config.successStatus ?? 200;
      return status === 204 ? noContent() : json(result, status);
    } catch (error) {
      if (error instanceof HttpError) {
        return errorResponse(error.message, error.status);
      }
      if (error instanceof z.ZodError) {
        return errorResponse(zodMessage(error), 400);
      }
      // Any other error is a bug (e.g. a database failure). Log it for the
      // operator and return the `ApiError` shape rather than letting the
      // framework surface its own unhandled-error body with a different shape.
      console.error(`Unhandled error in ${config.method} ${config.path}:`, error);
      return errorResponse("Internal server error", 500);
    }
  };

  return { config: config as EndpointConfig, handler };
}
