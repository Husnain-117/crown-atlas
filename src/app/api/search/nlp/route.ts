/**
 * POST /api/search/nlp
 *
 * Accepts a free-text query and returns matching property listings.
 * Intent parsing happens via gpt-4o-mini; parsed intents are cached in Redis
 * for 1 hour so repeated identical queries never re-hit OpenAI.
 *
 * Request body:  { "query": string, "limit"?: number, "offset"?: number }
 * Response:      same shape as GET /api/properties
 *   + `intent`       — structured params extracted from the query
 *   + `intentCached` — true when OpenAI was bypassed (perf indicator)
 *
 * Rate limiting: relies on Vercel's edge network + platform-level WAF.
 * Add IP-level rate limiting here if abuse occurs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { nlpSearch } from '@/lib/nlp-search';
import { deriveDisplayName } from '@/lib/display-name';

export const runtime    = 'nodejs';
export const dynamic    = 'force-dynamic';
export const maxDuration = 30; // gpt-4o-mini is fast; 30 s is generous headroom

// ─────────────────────────────────────────────────────────────────────────────
// Helpers (mirrors properties/route.ts shaping — keep in sync)
// ─────────────────────────────────────────────────────────────────────────────

function sanitizeAddress(addr: string): string {
  return addr.trim().replace(/^0+\s+/, '').replace(/\s{2,}/g, ' ');
}

function shapeProperty(p: any) {
  const baseAddress = sanitizeAddress(
    (p.unparsed_address as string | undefined) || ''
  );

  let photos: string[] = [];
  let mainImage = '';

  if (p.media_urls) {
    try {
      photos    = typeof p.media_urls === 'string' ? JSON.parse(p.media_urls) : p.media_urls;
      mainImage = p.main_photo_url || photos[0] || '';
    } catch {
      photos    = p.main_photo_url ? [p.main_photo_url] : [];
      mainImage = p.main_photo_url || '';
    }
  } else if (p.main_photo_url) {
    photos    = [p.main_photo_url];
    mainImage = p.main_photo_url;
  }

  if (!mainImage) {
    mainImage = '/placeholder.svg';
  }

  const item: Record<string, unknown> = {
    _id:               p.listing_key,
    id:                p.listing_key,
    listing_key:       p.listing_key,
    list_price:        p.list_price || 0,
    address:           baseAddress,
    city:              p.city,
    county:            p.state_or_province,
    postal_code:       p.postal_code || '',
    latitude:          p.latitude  || 0,
    longitude:         p.longitude || 0,
    property_type:     p.property_type,
    property_category: p.property_sub_type,
    bedrooms:          p.bedrooms_total  ?? null,
    bathrooms:         p.bathrooms_total ?? null,
    living_area_sqft:  p.living_area     ?? null,
    lot_size_sqft:     p.lot_size_sq_ft  || 0,
    year_built:        p.year_built,
    images:            photos,
    main_image_url:    mainImage,
    image:             mainImage,
    status:            p.status === 'Active' ? 'FOR SALE' : (p.status || 'UNKNOWN'),
    statusColor:       p.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
    days_on_market:    p.days_on_market,
    public_remarks:    p.public_remarks || '',
    photosCount:       photos.length || p.photos_count || 0,
    favorite:          false,
    createdAt:         p.created_at || new Date().toISOString(),
    updatedAt:         p.updated_at || new Date().toISOString(),
    location:          p.city,
    state:             p.state_or_province,
    zip_code:          p.postal_code || '',
    publicRemarks:     p.public_remarks || '',
  };

  item.display_name = deriveDisplayName({
    listing_key: p.listing_key,
    address:     baseAddress,
    city:        p.city,
    state:       p.state_or_province,
    county:      p.state_or_province,
    raw_json:    p.raw_json,
  });

  return item;
}

// ─────────────────────────────────────────────────────────────────────────────
// Route
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // ── Parse body ──────────────────────────────────────────────────────────
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Request body must be valid JSON' },
        { status: 400 }
      );
    }

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json(
        { success: false, error: 'Request body must be a JSON object' },
        { status: 400 }
      );
    }

    const { query, limit: rawLimit, offset: rawOffset } = body as Record<string, unknown>;

    if (typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { success: false, error: '"query" is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Guard against absurdly long queries (prompt injection mitigation)
    if (query.length > 500) {
      return NextResponse.json(
        { success: false, error: '"query" must not exceed 500 characters' },
        { status: 400 }
      );
    }

    const limit  = typeof rawLimit  === 'number' ? Math.min(Math.max(1, rawLimit),  100) : 20;
    const offset = typeof rawOffset === 'number' ? Math.max(0, rawOffset) : 0;

    // ── Search ──────────────────────────────────────────────────────────────
    const result = await nlpSearch(query.trim(), limit, offset);

    const data = result.properties.properties.map(shapeProperty);

    return NextResponse.json({
      success:      true,
      query,
      intent:       result.intent,
      intentCached: result.intentCached,
      data,
      pagination: {
        total:          result.properties.total,
        limit,
        offset,
        hasMore:        result.properties.hasMore,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/search/nlp]', msg);

    // Surface OpenAI key misconfiguration without leaking details
    if (msg.includes('OPENAI_API_KEY')) {
      return NextResponse.json(
        { success: false, error: 'NLP search not configured' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
