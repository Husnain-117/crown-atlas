import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { PROPERTY_CACHE_TAG } from "@/lib/cache/public-cache";
import { invalidateVercelCacheTags } from "@/lib/cache/vercel-runtime";
import { rdelPattern } from "@/lib/redis";
import { authorizeServerRequest } from "@/lib/server-route-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const unauthorized = authorizeServerRequest(request, "cron");
  if (unauthorized) return unauthorized;

  let scope = "properties";
  try {
    const body = await request.json() as { scope?: unknown };
    if (typeof body.scope === "string" && body.scope.trim()) scope = body.scope.trim();
  } catch {
    // Existing workers send no body, which keeps the property-only default.
  }

  const tags = scope === "location-statistics"
    ? [PROPERTY_CACHE_TAG, "county-city-counts", "county-homepage-stats"]
    : [PROPERTY_CACHE_TAG];
  for (const tag of tags) revalidateTag(tag);
  const paths = scope === "location-statistics" ? ["/market-reports"] : [];
  for (const path of paths) revalidatePath(path);

  const [redisKeysDeleted, vercelCache] = await Promise.all([
    rdelPattern("props:v1:*"),
    invalidateVercelCacheTags(tags),
  ]);

  return NextResponse.json({
    ok: true,
    scope,
    tags,
    paths,
    redisKeysDeleted,
    vercelCache,
    invalidatedAt: new Date().toISOString(),
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
