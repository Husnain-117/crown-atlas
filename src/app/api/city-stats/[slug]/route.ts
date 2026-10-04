import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CityStats {
  city_name: string;
  city_slug: string;
  active_listings: number;
  median_price: number;
  price_per_sqft: number;
  median_days_on_market: number;
  houses_count: number;
  condos_count: number;
  townhomes_count: number;
  under_300k_count: number;
  under_500k_count: number;
  under_750k_count: number;
  under_1m_count: number;
  under_2m_count: number;
  over_2m_count: number;
  pool_count: number;
  waterfront_count: number;
  ocean_view_count: number;
  single_story_count: number;
  garage_count: number;
  studio_count: number;
  one_bed_count: number;
  two_bed_count: number;
  three_bed_count: number;
  four_plus_bed_count: number;
  top_neighborhoods: any[];
  last_updated: string;
  data_source: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const pool = await getPool();

    const result = await pool.query<CityStats>(
      `SELECT
        city_name,
        city_slug,
        active_listings,
        median_price,
        price_per_sqft,
        median_days_on_market,
        houses_count,
        condos_count,
        townhomes_count,
        under_300k_count,
        under_500k_count,
        under_750k_count,
        under_1m_count,
        under_2m_count,
        over_2m_count,
        pool_count,
        waterfront_count,
        ocean_view_count,
        single_story_count,
        garage_count,
        studio_count,
        one_bed_count,
        two_bed_count,
        three_bed_count,
        four_plus_bed_count,
        top_neighborhoods,
        last_updated,
        data_source
      FROM city_statistics
      WHERE city_slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'City statistics not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching city stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch city statistics' },
      { status: 500 }
    );
  }
}
