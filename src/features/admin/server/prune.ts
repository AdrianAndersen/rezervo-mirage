/** Same keys, but with `undefined` removed from every value type. */
type Defined<T> = { [K in keyof T]?: Exclude<T[K], undefined> };

/**
 * Drop keys whose value is `undefined`. Zod's `.partial()` output carries
 * explicit `undefined`, which Prisma's `update({ data })` rejects under
 * `exactOptionalPropertyTypes`; pruning reconciles the two while keeping the
 * "omitted field = leave unchanged" semantics.
 */
export function pruneUndefined<T extends object>(value: T): Defined<T> {
  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry !== undefined) {
      result[key] = entry;
    }
  }
  return result as Defined<T>;
}
