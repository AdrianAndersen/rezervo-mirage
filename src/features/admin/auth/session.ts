import { clearSession, getSession, updateSession } from "@tanstack/react-start/server";

/**
 * Admin session: a single shared-password gate over the admin tools. On a
 * correct password we store `{ authenticated: true }` in an encrypted, signed,
 * httpOnly cookie (sealed by {@link ADMIN_SESSION_SECRET}). The provider API has
 * its own per-user auth and is unaffected by this gate.
 */

interface AdminSessionData {
  authenticated: boolean;
}

const COOKIE_NAME = "mirage_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/** Auth is fully bypassed when `ADMIN_AUTH_DISABLED=1` (local/CI). */
export function adminAuthDisabled(): boolean {
  return process.env["ADMIN_AUTH_DISABLED"] === "1";
}

/** The configured shared admin password (empty string if unset). */
export function adminPassword(): string {
  return process.env["ADMIN_PASSWORD"] ?? "";
}

function sessionConfig() {
  const password = process.env["ADMIN_SESSION_SECRET"] ?? "";
  if (password.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET must be set to at least 32 characters when admin auth is enabled",
    );
  }
  return {
    name: COOKIE_NAME,
    password,
    maxAge: MAX_AGE_SECONDS,
    cookie: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env["NODE_ENV"] === "production",
      path: "/",
    },
  };
}

/** True when the current request carries a valid admin session (or auth is off). */
export async function isAdminAuthenticated(): Promise<boolean> {
  if (adminAuthDisabled()) {
    return true;
  }
  const session = await getSession<AdminSessionData>(sessionConfig());
  return session.data.authenticated === true;
}

/** Mark the current request's session as authenticated. */
export async function startAdminSession(): Promise<void> {
  await updateSession<AdminSessionData>(sessionConfig(), { authenticated: true });
}

/** Clear the current request's admin session. */
export async function endAdminSession(): Promise<void> {
  await clearSession(sessionConfig());
}
