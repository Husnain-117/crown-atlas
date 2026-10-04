import assert from "node:assert/strict";
import {
  applyPublicCacheHeaders,
  PROPERTY_CACHE_TAG,
  PROPERTY_DETAIL_CACHE,
  PROPERTY_SEARCH_CACHE,
} from "../cache/public-cache";

assert.deepEqual(PROPERTY_SEARCH_CACHE, {
  ttlSeconds: 3600,
  staleWhileRevalidateSeconds: 21600,
});
assert.deepEqual(PROPERTY_DETAIL_CACHE, {
  ttlSeconds: 3600,
  staleWhileRevalidateSeconds: 21600,
});

const response = applyPublicCacheHeaders(new Response("ok"), {
  ttlSeconds: 60.9,
  staleWhileRevalidateSeconds: 300.7,
  tags: [PROPERTY_CACHE_TAG, "property-123", "property-123", "bad,tag"],
  status: "VERCEL_RUNTIME_HIT",
});

assert.equal(
  response.headers.get("Cache-Control"),
  "public, max-age=0, must-revalidate",
);
assert.equal(
  response.headers.get("Vercel-CDN-Cache-Control"),
  "public, s-maxage=60, stale-while-revalidate=300",
);
assert.equal(
  response.headers.get("CDN-Cache-Control"),
  "public, s-maxage=60, stale-while-revalidate=300",
);
assert.equal(
  response.headers.get("Vercel-Cache-Tag"),
  "properties,property-123,bad-tag",
);
assert.equal(response.headers.get("X-Data-Cache"), "VERCEL_RUNTIME_HIT");
assert.equal(response.headers.get("X-Cache"), "HIT");

console.log("publicCache tests passed");
