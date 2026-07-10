import { getRouteApi } from "@tanstack/react-router";

const chainRoute = getRouteApi("/kjeder/$chainSlug");

/**
 * The chain resolved from the URL slug by the `/kjeder/$chainSlug` layout loader.
 * Child pages read the numeric `id` from here instead of parsing the route param,
 * keeping the data layer keyed by id while the URL carries the human-readable slug.
 */
export function useChain() {
  return chainRoute.useLoaderData().chain;
}
