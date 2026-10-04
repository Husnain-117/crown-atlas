import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

/**
 * GET /api/unsubscribe?token={token}
 * Unsubscribe from saved search email alerts
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing token parameter' },
        { status: 400 }
      );
    }

    const pool = await getPool();
    
    const result = await pool.query(
      `UPDATE saved_searches 
       SET active = false 
       WHERE token = $1 
       RETURNING id`,
      [token]
    );

    if (result.rows.length === 0) {
      return NextResponse.redirect(
        new URL('/unsubscribe?scope=alerts&status=invalid', request.url)
      );
    }

    return NextResponse.redirect(
      new URL('/unsubscribe?scope=alerts&status=success', request.url)
    );
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.redirect(
      new URL('/unsubscribe?scope=alerts&status=error', request.url)
    );
  }
}
