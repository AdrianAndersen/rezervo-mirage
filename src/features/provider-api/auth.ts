import { createHmac, timingSafeEqual } from "node:crypto";

/** Access-token lifetime in seconds. */
export const TOKEN_TTL_SECONDS = 60 * 60;

interface TokenPayload {
  /** User id. */
  sub: number;
  /** Chain id the token is scoped to. */
  chain: number;
  /** Expiry, epoch seconds. */
  exp: number;
}

export interface TokenClaims {
  userId: number;
  chainId: number;
}

function secret(): string {
  // A fake test provider does not need a strong secret;
  return "rezervo-mirage-dev-secret";
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(data: string): string {
  return base64url(createHmac("sha256", secret()).update(data).digest());
}

export function createAccessToken(
  userId: number,
  chainId: number,
): { token: string; expiresIn: number } {
  const payload: TokenPayload = {
    sub: userId,
    chain: chainId,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const body = base64url(JSON.stringify(payload));
  const token = `${body}.${sign(body)}`;
  return { token, expiresIn: TOKEN_TTL_SECONDS };
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

export function verifyAccessToken(token: string): TokenClaims | null {
  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }
  const [body, signature] = parts as [string, string];
  if (!safeEqual(signature, sign(body))) {
    return null;
  }
  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenPayload;
  } catch {
    return null;
  }
  if (
    typeof payload.sub !== "number" ||
    typeof payload.chain !== "number" ||
    typeof payload.exp !== "number"
  ) {
    return null;
  }
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  return { userId: payload.sub, chainId: payload.chain };
}

export function authenticateRequest(request: Request, chainId: number): number | null {
  const header = request.headers.get("authorization");
  if (!header) {
    return null;
  }
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) {
    return null;
  }
  const claims = verifyAccessToken(match[1] as string);
  if (claims === null || claims.chainId !== chainId) {
    return null;
  }
  return claims.userId;
}
