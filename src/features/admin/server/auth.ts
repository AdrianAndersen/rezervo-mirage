import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

import { passwordMatches } from "@/features/admin/auth/password";
import { RateLimiter } from "@/features/admin/auth/rateLimit";
import {
  adminAuthDisabled,
  adminPassword,
  endAdminSession,
  isAdminAuthenticated,
  startAdminSession,
} from "@/features/admin/auth/session";

/**
 * Admin login/logout/status. These are the only admin server functions that are
 * NOT behind the admin gate — the login endpoint is throttled per client IP to
 * blunt brute-force password guessing.
 */

const loginLimiter = new RateLimiter({ maxAttempts: 5, windowMs: 5 * 60 * 1000 });

function clientKey(): string {
  return getRequestIP({ xForwardedFor: true }) ?? "unknown";
}

export interface LoginResult {
  ok: boolean;
  error?: string;
}

export const loginFn = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string() }))
  .handler(async ({ data }): Promise<LoginResult> => {
    if (adminAuthDisabled()) {
      return { ok: true };
    }
    const key = clientKey();
    const limit = loginLimiter.check(key);
    if (!limit.allowed) {
      return {
        ok: false,
        error: `For mange forsøk. Prøv igjen om ${limit.retryAfterSeconds} sekunder.`,
      };
    }
    if (!passwordMatches(data.password, adminPassword())) {
      loginLimiter.recordFailure(key);
      return { ok: false, error: "Feil passord." };
    }
    loginLimiter.reset(key);
    await startAdminSession();
    return { ok: true };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  if (!adminAuthDisabled()) {
    await endAdminSession();
  }
  return { ok: true };
});

export const authStatusFn = createServerFn().handler(async () => ({
  authenticated: await isAdminAuthenticated(),
  authDisabled: adminAuthDisabled(),
}));

export const authStatusQuery = () =>
  queryOptions({ queryKey: ["admin-auth"], queryFn: () => authStatusFn() });
