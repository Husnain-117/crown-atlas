import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { authorizeServerRequest } from '@/lib/server-route-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const unauthorized = authorizeServerRequest(request, 'admin');
  if (unauthorized) return unauthorized;

  try {
    const pool = await getPool();
    
    // Check properties updated in last 21 days
    const recentResult = await pool.query(`
      SELECT 
        COUNT(*) as count_last_21_days,
        MAX(updated_at) as most_recent_update,
        MIN(updated_at) as oldest_recent_update
      FROM properties 
      WHERE standard_status = 'Active' 
        AND updated_at >= NOW() - INTERVAL '21 days'
    `);
    
    // Check properties updated in last 24 hours
    const last24hResult = await pool.query(`
      SELECT COUNT(*) as count_last_24h
      FROM properties 
      WHERE standard_status = 'Active' 
        AND updated_at >= NOW() - INTERVAL '24 hours'
    `);
    
    // Get sample of recent properties
    const sampleResult = await pool.query(`
      SELECT listing_key, city, list_price, updated_at
      FROM properties 
      WHERE standard_status = 'Active' 
        AND updated_at >= NOW() - INTERVAL '21 days'
      ORDER BY updated_at DESC
      LIMIT 5
    `);
    
    return NextResponse.json({
      last21Days: recentResult.rows[0],
      last24Hours: last24hResult.rows[0],
      sampleProperties: sampleResult.rows,
      currentTimestamp: new Date().toISOString(),
      time21DaysAgo: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
    });
    
  } catch (error: any) {
    console.error('Error checking recent properties:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
