import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CityLifestyleResearch {
  id: number;
  city_name: string;
  city_slug: string;
  schools_education: string;
  lifestyle_amenities: string;
  last_updated: string;
  research_status: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const pool = await getPool();

    const result = await pool.query<CityLifestyleResearch>(
      `SELECT
        id,
        city_name,
        city_slug,
        schools_education,
        lifestyle_amenities,
        last_updated,
        research_status
      FROM city_lifestyle_research
      WHERE city_slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lifestyle research not found for this city' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching city lifestyle research:', error);
    return NextResponse.json(
      { error: 'Failed to fetch city lifestyle research' },
      { status: 500 }
    );
  }
}
