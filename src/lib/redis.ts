/**
 * Redis client — shared singleton for Node.js API routes.
 *
 * Uses `ioredis` (TCP), which requires the Node.js runtime.
 * Do NOT import this file in Edge middleware — use `@upstash/redis` (HTTP) there.
 *
 * Required env var: `REDIS_URL`  (e.g. redis://user:pass@host:6379)
 *
 * Graceful degradation: when `REDIS_URL` is absent every exported helper
 * returns `null` / `void` immediately so the application continues to
 * function without any caching layer in place.
 */

import Redis from "ioredis";

// ── Global singleton ──────────────────────────────────────────────────────────
// Reuses the same TCP connection across serverless invocations (warm starts)
// and across Next.js hot-reloads in development.

declare global {
  var __redis: Redis | null | undefined;
  var __redisMissingWarned: boolean | undefined;
}

function createRedisClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      const strict = process.env.REQUIRE_REDIS_IN_PRODUCTION === "true";
      if (strict) {
        throw new Error(
          "REDIS_URL is required in production when REQUIRE_REDIS_IN_PRODUCTION=true"
        );
      }

      if (!global.__redisMissingWarned) {
        global.__redisMissingWarned = true;
        console.warn(
          "[redis] REDIS_URL is missing in production. API caching is disabled and requests will hit the primary DB."
        );
      }
    }

    if (process.env.NODE_ENV !== "production") {
      console.debug(
        "[redis] REDIS_URL not configured — caching disabled. " +
          "Set REDIS_URL in .env.local to enable."
      );
    }
    return null;
  }

  const client = new Redis(url, {
    // Keep retries low — on serverless we prefer fast failure over long retry loops
    maxRetriesPerRequest: 2,
    enableReadyCheck: false,   // skip the PING-on-connect check → faster cold starts
    lazyConnect: true,          // establish TCP only on first command, not on construction
    connectTimeout: 4_000,      // ms to establish the TCP connection
    commandTimeout: 2_000,      // ms per command before rejection
    retryStrategy: (attempt) => {
      // Back off quickly; stop retrying after the 3rd attempt
      if (attempt > 3) return null; // return null = stop retrying
      return Math.min(attempt * 100, 400); // 100 ms, 200 ms, 300 ms
    },
  });

  // Error events MUST be handled — an unhandled 'error' event crashes Node
  client.on("error", (err: Error) => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[redis] connection error:", err.message);
    }
  });

  return client;
}

/** Returns the shared Redis client, or `null` when Redis is not configured. */
function getRedis(): Redis | null {
  if (global.__redis === undefined) {
    global.__redis = createRedisClient();
  }
  return global.__redis ?? null;
}

// ── Typed cache helpers ───────────────────────────────────────────────────────
// All helpers are non-throwing: errors are swallowed and `null`/`void` returned
// so that a Redis outage never propagates to the main request path.

/**
 * Get a cached string by key.
 * Returns `null` on cache miss, client unavailability, or command error.
 */
export async function rget(key: string): Promise<string | null> {
  const r = getRedis();
  if (!r) return null;
  try {
    return await r.get(key);
  } catch {
    return null;
  }
}

/**
 * Set a string value with a TTL.
 * @param ttlSeconds — expiry in seconds (use 0 for no expiry, not recommended)
 * Errors are swallowed — cache writes are never fatal to the caller.
 */
export async function rset(
  key: string,
  value: string,
  ttlSeconds: number
): Promise<void> {
  const r = getRedis();
  if (!r) return;
  try {
    if (ttlSeconds > 0) {
      await r.set(key, value, "EX", ttlSeconds);
    } else {
      await r.set(key, value);
    }
  } catch {
    /* non-fatal */
  }
}

/**
 * Deserialise a JSON-encoded cached value.
 * Returns `null` on miss, parse failure, or client unavailability.
 */
export async function rjson<T>(key: string): Promise<T | null> {
  const raw = await rget(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Delete one or more keys.
 * Errors are swallowed — cache invalidation is best-effort.
 */
export async function rdel(...keys: string[]): Promise<void> {
  const r = getRedis();
  if (!r || keys.length === 0) return;
  try {
    await r.del(...keys);
  } catch {
    /* non-fatal */
  }
}

/**
 * Delete all keys matching a glob pattern using SCAN (non-blocking).
 * Returns the number of keys deleted.
 * Errors are swallowed — cache invalidation is best-effort.
 *
 * Example: `rdelPattern("props:v1:*")` — clears all property-search cache entries.
 */
export async function rdelPattern(pattern: string): Promise<number> {
  const r = getRedis();
  if (!r) return 0;
  try {
    let cursor = "0";
    let deleted = 0;
    do {
      const [nextCursor, keys] = await r.scan(cursor, "MATCH", pattern, "COUNT", 200);
      cursor = nextCursor;
      if (keys.length > 0) {
        await r.del(...keys);
        deleted += keys.length;
      }
    } while (cursor !== "0");
    return deleted;
  } catch {
    return 0;
  }
}

/**
 * Ping Redis and return `true` when it is reachable.
 * Useful for `/api/health` checks.
 */
export async function rping(): Promise<boolean> {
  const r = getRedis();
  if (!r) return false;
  try {
    return (await r.ping()) === "PONG";
  } catch {
    return false;
  }
}
