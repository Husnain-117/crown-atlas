import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import {
  getCountyAndCitySlugForCityName,
  getCountyAndCitySlugForZip,
} from '@/lib/counties';

export interface AutoCompleteResult {
  type: "city" | "zip";
  value: {
    city: string;
    propertyCount?: number;
    countySlug?: string;
    citySlug?: string;
    postalCode?: string;
    label: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || '';

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const searchPattern = `%${query}%`;
    const results: AutoCompleteResult[] = [];
    const pool = await getPool();
    const isZipLike = /^\d{2,5}$/.test(query.trim());

    // City search
    const cityQuery = `
      SELECT city, COUNT(*) as property_count
      FROM properties
      WHERE city ILIKE $1
        AND city IS NOT NULL AND city != ''
      GROUP BY city
      ORDER BY property_count DESC
      LIMIT 8
    `;
    const cityResults = await pool.query(cityQuery, [searchPattern]);

    for (const row of cityResults.rows) {
      const resolved = getCountyAndCitySlugForCityName(row.city);
      results.push({
        type: 'city',
        value: {
          city: row.city,
          propertyCount: parseInt(row.property_count) || 0,
          countySlug: resolved?.countySlug,
          citySlug: resolved?.citySlug,
          label: row.city,
        },
      });
    }

    // ZIP search (only when input looks numeric)
    if (isZipLike) {
      const zipQuery = `
        SELECT split_part(postal_code, '-', 1) AS zip, COUNT(*) AS cnt
        FROM properties
        WHERE split_part(postal_code, '-', 1) LIKE $1
          AND postal_code IS NOT NULL AND postal_code != ''
        GROUP BY zip
        ORDER BY cnt DESC
        LIMIT 6
      `;
      const zipResults = await pool.query(zipQuery, [`${query.trim()}%`]);

      for (const row of zipResults.rows) {
        const resolved = getCountyAndCitySlugForZip(row.zip);
        results.push({
          type: 'zip',
          value: {
            city: resolved?.cityName || '',
            propertyCount: parseInt(row.cnt) || 0,
            countySlug: resolved?.countySlug,
            citySlug: resolved?.citySlug,
            postalCode: row.zip,
            label: resolved?.cityName ? `${row.zip} — ${resolved.cityName}` : row.zip,
          },
        });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Autocomplete API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch autocomplete results' },
      { status: 500 }
    );
  }
}
