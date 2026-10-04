/**
 * GET /api/cron/check-price-alerts   ← Vercel Cron (GET only)
 * POST /api/cron/check-price-alerts  ← Manual / curl invocation
 *
 * Scans active un-fired price alerts, compares against live property data,
 * and delivers email notifications for listings that crossed their threshold.
 *
 * Schedule (free tier): daily at 04:00 UTC — "0 4 * * *" in vercel.json.
 * Schedule (pro/live):  every 30 minutes  — "* /30 * * * *" in vercel.json.
 *
 * Auth: Bearer CRON_SECRET (Vercel Cron header OR manual curl).
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkPriceAlerts } from '@/lib/price-alert-checker';
import { authorizeServerRequest } from '@/lib/server-route-auth';

export const runtime    = 'nodejs';
export const dynamic    = 'force-dynamic';
export const maxDuration = 60; // seconds — well within Vercel Pro limit

export async function POST(request: NextRequest): Promise<NextResponse> {
  const unauthorized = authorizeServerRequest(request, 'cron');
  if (unauthorized) return unauthorized;

  // ── Batch size override (optional) ──────────────────────────────────────
  const { searchParams } = new URL(request.url);
  const rawBatch = searchParams.get('batch');
  const batch    = rawBatch
    ? Math.min(Math.max(1, parseInt(rawBatch, 10)), 500)
    : 100;

  // ── Run ──────────────────────────────────────────────────────────────────
  try {
    const result = await checkPriceAlerts(batch);

    console.log('[cron/check-price-alerts]', result);

    return NextResponse.json({
      ok:         true,
      checked:    result.checked,
      fired:      result.fired,
      failed:     result.failed,
      durationMs: result.durationMs,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[cron/check-price-alerts] fatal error', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// Vercel Cron always invokes GET — delegate to the same handler.
export async function GET(request: NextRequest): Promise<NextResponse> {
  return POST(request);
}
