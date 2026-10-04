import { NextRequest, NextResponse } from 'next/server';
import { getPgPool } from '@/lib/db';
import {
  applyPublicCacheHeaders,
  PROPERTY_CACHE_TAG,
  PROPERTY_DETAIL_CACHE,
} from '@/lib/cache/public-cache';
import { getRuntimeJson, setRuntimeJson } from '@/lib/cache/vercel-runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/properties/price-range
 * Returns the minimum and maximum list_price from the properties table
 * Optionally filters by status, propertyType, city, state
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // e.g., 'Active'
    const propertyType = searchParams.get('propertyType');
    const city = searchParams.get('city');
    const state = searchParams.get('state');
    const cacheKey = `property-price-range:v1:${new URLSearchParams({
      city: city || '',
      propertyType: propertyType || '',
      state: state || '',
      status: status || '',
    }).toString()}`;
    const cacheTags = [PROPERTY_CACHE_TAG, 'property-price-range'];
    const runtimeCached = await getRuntimeJson<{
      success: true;
      data: {
        minPrice: number;
        maxPrice: number;
        rawMin: number;
        rawMax: number;
        totalCount: number;
      };
    }>(cacheKey);
    if (runtimeCached) {
      return applyPublicCacheHeaders(NextResponse.json(runtimeCached), {
        ...PROPERTY_DETAIL_CACHE,
        tags: cacheTags,
        status: 'VERCEL_RUNTIME_HIT',
      });
    }

    const pool = await getPgPool();
    
    // Build WHERE clause based on optional filters
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`LOWER(standard_status) = LOWER($${paramIndex})`);
      values.push(status);
      paramIndex++;
    }

    if (propertyType) {
      // Handle special cases like ResidentialLease
      if (propertyType === 'ResidentialLease') {
        conditions.push(`LOWER(property_type) LIKE LOWER($${paramIndex})`);
        values.push('%lease%');
      } else if (propertyType === 'Commercial' && status === 'for_rent') {
        // Commercial lease properties
        conditions.push(`LOWER(property_type) = LOWER($${paramIndex})`);
        values.push('Commercial');
      } else {
        conditions.push(`LOWER(property_type) = LOWER($${paramIndex})`);
        values.push(propertyType);
      }
      paramIndex++;
    }

    if (city) {
      conditions.push(`LOWER(city) LIKE LOWER($${paramIndex})`);
      values.push(`%${city}%`);
      paramIndex++;
    }

    if (state) {
      conditions.push(`LOWER(state_or_province) = LOWER($${paramIndex})`);
      values.push(state);
      paramIndex++;
    }

    // Exclude land properties by default
    conditions.push(`LOWER(property_type) <> 'land'`);
    
    // Only get prices where list_price is not null
    conditions.push(`list_price IS NOT NULL AND list_price > 0`);

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        MIN(list_price)::int AS min_price,
        MAX(list_price)::int AS max_price,
        COUNT(*)::int AS total_count
      FROM properties
      ${whereClause}
    `;

    console.log('[Price Range API] Query:', sql);
    console.log('[Price Range API] Values:', values);

    const result = await pool.query(sql, values);
    const row = result.rows[0];

    const minPrice = row?.min_price || 0;
    const maxPrice = row?.max_price || 50000000; // Fallback to 50M if no data

    // Round to nearest 100k for better UX
    const roundedMin = Math.max(0, Math.floor(minPrice / 100000) * 100000);
    const roundedMax = Math.ceil(maxPrice / 100000) * 100000;

    console.log('[Price Range API] Result:', { 
      minPrice, 
      maxPrice, 
      roundedMin, 
      roundedMax,
      totalCount: row?.total_count || 0
    });

    const payload = {
      success: true,
      data: {
        minPrice: roundedMin,
        maxPrice: roundedMax,
        rawMin: minPrice,
        rawMax: maxPrice,
        totalCount: row?.total_count || 0,
      },
    } as const;
    await setRuntimeJson(cacheKey, payload, {
      ttlSeconds: PROPERTY_DETAIL_CACHE.ttlSeconds,
      tags: cacheTags,
      name: 'property-price-range',
    });

    return applyPublicCacheHeaders(NextResponse.json(payload), {
      ...PROPERTY_DETAIL_CACHE,
      tags: cacheTags,
      status: 'MISS',
    });
  } catch (error: any) {
    console.error('[Price Range API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch price range',
        message: error?.message || 'Unknown error',
        // Return safe defaults
        data: {
          minPrice: 0,
          maxPrice: 50000000,
          rawMin: 0,
          rawMax: 50000000,
          totalCount: 0,
        },
      },
      { status: 500 },
    );
  }
}

