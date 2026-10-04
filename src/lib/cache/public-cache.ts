import { recordCacheObservation } from "@/lib/observability";

export type DataCacheStatus = "VERCEL_RUNTIME_HIT" | "REDIS_HIT" | "MISS";

export const PROPERTY_CACHE_TAG = "properties";

export const PROPERTY_SEARCH_CACHE = {
  ttlSeconds: 3600,
  staleWhileRevalidateSeconds: 21600,
} as const;

export const PROPERTY_DETAIL_CACHE = {
  ttlSeconds: 3600,
  staleWhileRevalidateSeconds: 21600,
} as const;

interface PublicCacheOptions {
  ttlSeconds: number;
  staleWhileRevalidateSeconds: number;
  tags: string[];
  status: DataCacheStatus;
}

function normalizeTags(tags: string[]): string[] {
  return Array.from(
    new Set(
      tags
        .map((tag) => tag.trim().replace(/,/g, "-"))
        .filter(Boolean),
    ),
  );
}

/**
 * Keep browsers on fresh data while allowing Vercel's CDN to serve and
 * asynchronously refresh public responses at the edge.
 */
export function applyPublicCacheHeaders<T extends Response>(
  response: T,
  options: PublicCacheOptions,
): T {
  const ttl = Math.max(0, Math.floor(options.ttlSeconds));
  const swr = Math.max(0, Math.floor(options.staleWhileRevalidateSeconds));
  const edgePolicy = `public, s-maxage=${ttl}, stale-while-revalidate=${swr}`;
  const tags = normalizeTags(options.tags);

  response.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  response.headers.set("CDN-Cache-Control", edgePolicy);
  response.headers.set("Vercel-CDN-Cache-Control", edgePolicy);
  if (tags.length > 0) {
    response.headers.set("Vercel-Cache-Tag", tags.join(","));
  }
  response.headers.set("X-Data-Cache", options.status);
  response.headers.set("X-Cache", options.status === "MISS" ? "MISS" : "HIT");
  response.headers.set(
    "Cache-Status",
    "CrownCoastal; " +
      (options.status === "MISS" ? "fwd=miss" : "hit") +
      "; detail=" +
      options.status,
  );
  recordCacheObservation(tags[1] || tags[0] || "public-data", options.status);

  return response;
}
