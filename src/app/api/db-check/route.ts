// /src/app/api/db-check/route.ts
import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const startTime = Date.now();
  const host = request.headers.get('host') || 'unknown';
  
  try {
    console.log(`[API] GET /api/db-check - Host: ${host}`);
    console.log(`[DB] Testing database connection...`);
    
    const pool = await getPool();
    console.log(`[DB] ✅ Pool obtained successfully`);
    
    const { rows } = await pool.query("select now() as ts");
    const duration = Date.now() - startTime;
    
    console.log(`[API] ✅ GET /api/db-check - Success in ${duration}ms`);
    console.log(`[DB] Connection test successful, timestamp: ${rows?.[0]?.ts ?? null}`);
    
    return NextResponse.json({
      ok: true,
      via: "db-check",
      ts: rows?.[0]?.ts ?? null,
      duration_ms: duration,
    });
  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error(`[API] ❌ GET /api/db-check - Error after ${duration}ms:`, err?.message || err);
    console.error(`[DB] Connection test failed:`, err);
    return NextResponse.json(
      { ok: false, error: String(err?.message || err), duration_ms: duration },
      { status: 500 }
    );
  }
}
