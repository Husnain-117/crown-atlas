import { getCache, invalidateByTag, type RuntimeCache } from "@vercel/functions";

const MAX_CACHE_ITEM_BYTES = 1_800_000;
let runtimeCache: RuntimeCache | null = null;

function cache(): RuntimeCache {
  runtimeCache ??= getCache({
    namespace: "crown-coastal",
    namespaceSeparator: ":",
  });
  return runtimeCache;
}

export async function getRuntimeJson<T>(key: string): Promise<T | null> {
  try {
    const value = await cache().get(key);
    if (value === null || value === undefined) return null;
    if (typeof value === "string") return JSON.parse(value) as T;
    return value as T;
  } catch {
    return null;
  }
}

export async function setRuntimeJson<T>(
  key: string,
  value: T,
  options: { ttlSeconds: number; tags: string[]; name: string },
): Promise<boolean> {
  try {
    const serialized = JSON.stringify(value);
    if (Buffer.byteLength(serialized, "utf8") > MAX_CACHE_ITEM_BYTES) {
      return false;
    }

    await cache().set(key, value, {
      ttl: options.ttlSeconds,
      tags: options.tags,
      name: options.name,
    });
    return true;
  } catch {
    return false;
  }
}

/** Purges matching Vercel CDN, Runtime Cache, and Data Cache entries. */
export async function invalidateVercelCacheTags(
  tags: string[],
): Promise<"global" | "runtime" | "unavailable"> {
  try {
    await invalidateByTag(tags);
    return "global";
  } catch {
    try {
      await cache().expireTag(tags);
      return "runtime";
    } catch {
      return "unavailable";
    }
  }
}
