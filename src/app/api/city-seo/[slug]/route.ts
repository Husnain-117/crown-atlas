import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CitySeoContent {
  id: number;
  city_name: string;
  city_slug: string;
  h1_title: string;
  intro_paragraph: string;
  editorial_content: string;
  last_updated: string;
  generated_at: string;
  data_source: string;
  active_listings: number;
  median_price: number;
  top_neighborhoods: any[];
  gpt_model: string;
  generation_status: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const pool = await getPool();

    const result = await pool.query<CitySeoContent>(
      `SELECT
        id,
        city_name,
        city_slug,
        h1_title,
        intro_paragraph,
        editorial_content,
        last_updated,
        generated_at,
        data_source,
        active_listings,
        median_price,
        top_neighborhoods,
        gpt_model,
        generation_status
      FROM city_seo_content
      WHERE city_slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'SEO content not found for this city' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching city SEO content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch city SEO content' },
      { status: 500 }
    );
  }
}
