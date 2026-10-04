import { NextResponse } from 'next/server';
import { searchProperties } from '@/lib/db/property-repo';
import { authorizeServerRequest } from '@/lib/server-route-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const unauthorized = authorizeServerRequest(request, 'admin');
  if (unauthorized) return unauthorized;

  try {
    console.log('Testing daysListed filter...');
    
    // Test 1: Without daysListed filter
    const result1 = await searchProperties({
      status: 'for_sale',
      state: 'CA',
      limit: 5,
      offset: 0,
    });
    
    console.log('Without daysListed filter:', result1.total, 'properties');
    
    // Test 2: With daysListed=21 filter
    const result2 = await searchProperties({
      status: 'for_sale',
      state: 'CA',
      daysListed: 21,
      limit: 5,
      offset: 0,
    });
    
    console.log('With daysListed=21 filter:', result2.total, 'properties');
    
    // Test 3: Direct DB query
    const { getPool } = await import('@/lib/db');
    const pool = await getPool();
    const directResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM properties 
      WHERE standard_status = 'Active' 
        AND property_type = 'Residential'
        AND LOWER(state_or_province) = 'ca'
        AND COALESCE(updated_at, created_at) >= NOW() - INTERVAL '21 days'
    `);
    
    console.log('Direct DB query count:', directResult.rows[0].count);
    
    return NextResponse.json({
      withoutFilter: {
        total: result1.total,
        sampleCount: result1.properties.length
      },
      withFilter: {
        total: result2.total,
        sampleCount: result2.properties.length,
        sampleProperties: result2.properties.map(p => ({
          listing_key: p.listing_key,
          city: p.city,
          modification_timestamp: p.modification_timestamp
        }))
      },
      directQuery: directResult.rows[0]
    });
    
  } catch (error: any) {
    console.error('Test failed:', error);
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
