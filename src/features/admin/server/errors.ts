/** Known Prisma error codes translated to friendly Norwegian messages. */
const PRISMA_MESSAGES: Record<string, string> = {
  P2002: "En rad med samme unike verdi finnes allerede",
  P2003: "Ugyldig referanse til en annen rad",
  P2025: "Fant ikke raden",
};

/**
 * Map a repository error to a user-facing `Error`. Known Prisma codes become
 * friendly Norwegian messages; anything else is returned unchanged so it keeps
 * its original stack and surfaces as an unexpected failure.
 */
export function toFriendlyError(error: unknown): Error {
  const code = (error as { code?: string } | null)?.code;
  if (code !== undefined && code in PRISMA_MESSAGES) {
    return new Error(PRISMA_MESSAGES[code]);
  }
  return error instanceof Error ? error : new Error("Noe gikk galt");
}

/** Run a repository call, rethrowing any error through {@link toFriendlyError}. */
export async function runRepo<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw toFriendlyError(error);
  }
}
