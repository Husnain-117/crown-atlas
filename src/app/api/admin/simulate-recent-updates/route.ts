import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { authorizeServerRequest } from '@/lib/server-route-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const unauthorized = authorizeServerRequest(request, 'admin');
  if (unauthorized) return unauthorized;

  try {
    const { count = 10 } = await request.json().catch(() => ({ count: 10 }));
    
    const pool = await getPool();
    
    // Update some properties to have recent updated_at timestamps
    const result = await pool.query(`
      UPDATE properties 
      SET updated_at = NOW() 
      WHERE listing_key IN (
        SELECT listing_key 
        FROM properties 
        WHERE standard_status = 'Active' 
        ORDER BY random() 
        LIMIT $1
      )
      RETURNING listing_key, city, list_price, updated_at;
    `, [count]);
    
    console.log(`Updated ${result.rows.length} properties with recent timestamps`);
    
    return NextResponse.json({
      success: true,
      updated: result.rows.length,
      properties: result.rows
    });
    
  } catch (error: any) {
    console.error('Error simulating updates:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
