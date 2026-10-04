import { NextRequest, NextResponse } from 'next/server';
import { authorizeServerRequest } from '@/lib/server-route-auth';
import { matchSearchAlerts } from '@/lib/jobs/match-search-alerts';

/**
 * Cron job: Match saved searches with new listings and send email alerts
 * Runs daily at 08:00 UTC via Vercel Cron
 * Configure in vercel.json: { "path": "/api/cron/match-alerts", "schedule": "0 8 * * *" }
 */

export async function GET(request: NextRequest) {
  const unauthorized = authorizeServerRequest(request, 'cron');
  if (unauthorized) return unauthorized;

  try {
    const result = await matchSearchAlerts();

    return NextResponse.json({
      success: true,
      ...result,
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (error) {
    console.error('Error in match-alerts cron:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
