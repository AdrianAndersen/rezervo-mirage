/**
 * Render TanStack Form field errors as a single string. Errors may be plain
 * strings (function validators) or Standard Schema issues (`{ message }`, from
 * Zod); this normalizes both. Returns `undefined` when there is no error so
 * Mantine inputs show no error state.
 */
export function fieldErrorText(errors: readonly unknown[]): string | undefined {
  const text = errors
    .map((error) =>
      typeof error === "string" ? error : (error as { message?: string } | null)?.message,
    )
    .filter((message): message is string => typeof message === "string" && message.length > 0)
    .join(", ");
  return text.length > 0 ? text : undefined;
}
