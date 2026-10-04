import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { authorizeServerRequest } from '@/lib/server-route-auth';

/**
 * GET /api/admin/inquiries
 * Admin-only endpoint to view all inquiries
 * Requires x-admin-key header for authentication
 */

export async function GET(request: NextRequest) {
  const unauthorized = authorizeServerRequest(request, 'admin');
  if (unauthorized) return unauthorized;

  try {
    const pool = await getPool();

    // Get recent inquiries with optional listing details
    const result = await pool.query(
      `SELECT 
        i.id,
        i.listing_id,
        i.name,
        i.email,
        i.phone,
        i.message,
        i.source,
        i.created_at,
        p.unparsed_address AS listing_address,
        p.city AS listing_city
       FROM inquiries i
       LEFT JOIN properties p ON p.listing_key = i.listing_id
       ORDER BY i.created_at DESC
       LIMIT 100`
    );

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      inquiries: result.rows,
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
