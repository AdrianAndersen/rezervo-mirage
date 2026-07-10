import { createMiddleware } from "@tanstack/react-start";

import { isAdminAuthenticated } from "./session";

/**
 * Server-side guard for admin server functions. This is the real security
 * boundary (the UI `beforeLoad` redirect is only UX): every admin data function
 * chains `.middleware([adminAuthMiddleware])`, so unauthenticated calls are
 * rejected regardless of the UI.
 *
 * Note: this must be attached to a *direct* `createServerFn(...)` call — the
 * TanStack Start compiler pattern-matches that call to split server-only code
 * out of the client bundle, so it cannot be hidden behind a wrapper factory.
 */
export const adminAuthMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    if (!(await isAdminAuthenticated())) {
      throw new Error("Ikke autorisert");
    }
    return next();
  },
);
