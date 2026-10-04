// src/lib/db/connection.ts
// Backward compatibility: Re-export from unified db.ts
// This file is kept for backward compatibility with existing imports

export { getPgPool, getPool, pgHealthCheck } from '../db';

// Legacy reset functions (no-op for now, pool is managed globally)
export function onPoolReset(_fn: () => void) {
  // No-op: pool is managed globally in db.ts
  console.log('[DB] onPoolReset called (no-op - pool managed globally)');
}

export async function resetPgPool(reason = "manual-reset") {
  // No-op: pool is managed globally in db.ts
  // The global pool will be reset automatically on transient errors
  console.log(`[DB] Pool reset requested (${reason}) - handled by global pool management`);
}
