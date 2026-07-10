import { redirect } from "@tanstack/react-router";

import { authStatusFn } from "@/features/admin/server/auth";

/**
 * Route `beforeLoad` guard for admin pages: redirect to `/login` (remembering
 * where we came from) unless the request carries a valid admin session. This is
 * UX only — the server-function middleware is the real security boundary.
 */
export async function requireAdmin(location: { href: string }): Promise<void> {
  const { authenticated } = await authStatusFn();
  if (!authenticated) {
    throw redirect({ to: "/login", search: { redirect: location.href } });
  }
}
