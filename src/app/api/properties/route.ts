import { NextRequest, NextResponse } from 'next/server';
import { searchProperties, searchPropertiesCursor } from '@/lib/db/property-repo';
import { isDatabaseConfigured } from '@/lib/db';
import { deriveDisplayName } from '@/lib/display-name';
import { rjson, rset } from '@/lib/redis';
import {
  applyPublicCacheHeaders,
  PROPERTY_CACHE_TAG,
  PROPERTY_SEARCH_CACHE,
} from '@/lib/cache/public-cache';
import { getRuntimeJson, setRuntimeJson } from '@/lib/cache/vercel-runtime';
import { appendServerTiming, recordDatabaseTiming } from '@/lib/observability';
import { propertyDisplayStatus } from '@/lib/property-status';
import { buildPropertyMediaUrls } from '@/lib/property-normalization';

export const runtime = 'nodejs';        // Node runtime required for GCP Cloud SQL
export const dynamic = 'force-dynamic'; // Never statically generate this route

type PropertySearchPayload = {
  success: true;
  data: unknown[];
  pagination: Record<string, unknown>;
};

// Strip leading zeroes and collapse repeated whitespace from addresses.
function sanitizeAddress(addr: string): string {
  return addr.trim().replace(/^0+\s+/, '').replace(/\s{2,}/g, ' ');
}

/**
 * Build a deterministic, URL-safe cache key from the search parameters.
 * All relevant params are included and sorted so that equivalent queries
 * always produce the same key regardless of insertion order.
 * Schema version prefix (`v3:`) ensures stale entries are naturally
 * invalidated when the response shape changes.
 */
function buildSearchCacheKey(sp: URLSearchParams): string {
  const CACHE_PARAMS = [
    'city','county','state','status',
    'minPrice','maxPrice','minBedrooms','maxBedrooms',
    'minBathrooms','maxBathrooms','propertyType','propertyCategory',
    'hasPool','hasView','hasOceanView','isWaterfront','hasGarage','priceReduced','openHousesOnly','openHouseDate',
    'isNewConstruction','isSeniorCommunity','hasFireplace',
    'minYearBuilt','maxYearBuilt','minLotSize','maxLotSize','minLivingArea','maxLivingArea','maxHoaFee',
    'keywords','locationKeywords','sortBy','limit','minLat','maxLat','minLng','maxLng','daysListed',
    // cursor takes precedence over offset — one or the other is included
    ...(sp.has('cursor') ? ['cursor'] : ['offset']),
  ];
  const parts = CACHE_PARAMS.map((k) => `${k}=${sp.get(k) ?? ''}`);
  return `props:v4:${parts.join('|')}`;
}

/**
 * Shape a raw property DB row into the standard API response object.
 * Centralised here so both cursor and offset code paths produce identical output.
 */
function shapeProperty(p: any) {
  const baseAddress = sanitizeAddress(
    (p.address as string | undefined) ||
    (p.cleaned_address as string | undefined) ||
    (p.unparsed_address as string | undefined) ||
    ''
  );

  const photos = buildPropertyMediaUrls({
    listingKey: p.listing_key,
    mainPhotoUrl: p.main_photo_url,
    mediaUrls: p.media_urls,
    photosCount: p.photos_count,
  }, 5);
  const mainImage = photos[0] || '';

  const displayStatus = propertyDisplayStatus(p.status, p.property_type);

  const item: Record<string, unknown> = {
    _id:         p.listing_key,
    id:          p.listing_key,
    listing_key: p.listing_key,
    property_entity_key: p.property_entity_key || null,
    list_price:  p.list_price || 0,
    address:     baseAddress,
    city:        p.city,
    county:      p.county_or_parish || '',
    postal_code: p.postal_code || '',
    latitude:    p.latitude  || 0,
    longitude:   p.longitude || 0,
    property_type:     p.property_type,
    property_sub_type: p.property_sub_type,
    property_category: p.property_sub_type,
    bedrooms:          p.bedrooms_total  ?? null,
    bathrooms:         p.bathrooms_total ?? null,
    living_area_sqft:  p.living_area     ?? null,
    lot_size_sqft:     p.lot_size_sq_ft  || p.lot_size_sqft || 0,
    year_built:        p.year_built,
    images:            photos,
    main_image_url:    mainImage || null,
    image:             mainImage || null,
    status:            displayStatus.label,
    statusColor:       displayStatus.color,
    days_on_market:    p.days_on_market,
    previous_list_price: p.original_list_price ?? null,
    price_change_timestamp: p.price_change_timestamp ?? null,
    public_remarks:    p.public_remarks || '',
    h1_heading:        p.h1_heading,
    title:             p.title,
    seo_title:         p.seo_title,
    photosCount:       p.photos_count ?? photos.length,
    favorite:          false,
    createdAt:         p.created_at || new Date().toISOString(),
    updatedAt:         p.updated_at || new Date().toISOString(),
    location:          p.city,
    state:             p.state || p.state_or_province || '',
    zip_code:          p.postal_code || '',
    publicRemarks:     p.public_remarks || '',
    hoa_fee:           p.hoa_fee ?? null,
    hoa_fee_frequency: p.hoa_fee_frequency ?? null,
    garage_spaces:     p.garage_spaces ?? null,
    pool_private_yn:   p.pool_private_yn ?? false,
    waterfront_yn:     p.waterfront_yn ?? false,
    view_yn:           p.view_yn ?? false,
    view:              p.view ?? null,
    new_construction_yn: p.new_construction_yn ?? null,
    senior_community_yn: p.senior_community_yn ?? null,
    fireplace_yn:      p.fireplace_yn ?? null,
    school_rating:     p.school_rating ?? null,
    open_house_start_timestamp: p.open_house_start_timestamp ?? null,
    open_house_end_timestamp:   p.open_house_end_timestamp ?? null,
  };

  item.display_name = deriveDisplayName({
    listing_key: p.listing_key,
    address:     baseAddress,
    city:        p.city,
    state:       p.state || p.state_or_province,
    county:      p.county_or_parish,
    raw_json:    p.raw_json,
  });

  return item;
}

/**
 * GET /api/properties
 *
 * Property listing search. All user-supplied values are forwarded to
 * `searchProperties` / `searchPropertiesCursor` which use parameterised
 * queries — no SQL injection risk.
 *
 * Query parameters:
 *   city, state, county, status, minPrice, maxPrice,
 *   minBedrooms, maxBedrooms, minBathrooms, maxBathrooms,
 *   propertyType, propertyCategory, hasPool, hasView,
 *   keywords, locationKeywords, sortBy, limit (max 100), daysListed, openHousesOnly
 *
 *   Pagination — mutually exclusive, cursor takes priority:
 *   cursor  (base64url keyset token — preferred for live data)
 *   offset  (legacy integer offset — kept for backward compatibility)
 */
export async function GET(request: NextRequest) {
  const requestStartedAt = performance.now();
  try {
    const { searchParams } = new URL(request.url);

    if (!isDatabaseConfigured()) {
      const limit = Math.min(Math.max(1, Number(searchParams.get('limit') || 20)), 500);
      const offset = Math.max(0, Number(searchParams.get('offset') || 0));
      const response = NextResponse.json({
        success: true,
        data: [],
        dataAvailable: false,
        message: 'Current listing data is temporarily unavailable.',
        pagination: { total: 0, limit, offset, hasMore: false, totalEstimated: false, mode: 'offset' },
      });
      response.headers.set('Cache-Control', 'no-store');
      response.headers.set('X-Data-Available', 'false');
      appendServerTiming(response, {
        total: { durationMs: performance.now() - requestStartedAt },
        database: { description: 'not configured' },
      });
      return response;
    }

    // ── Parse query parameters ───────────────────────────────────────────────
    const city   = searchParams.get('city')   || undefined;
    const county = searchParams.get('county') || undefined;
    const state  = searchParams.get('state')  || undefined;
    const status = searchParams.get('status') || undefined;

    const minPrice     = searchParams.get('minPrice')     ? Number(searchParams.get('minPrice'))     : undefined;
    const maxPrice     = searchParams.get('maxPrice')     ? Number(searchParams.get('maxPrice'))     : undefined;
    const minBedrooms  = searchParams.get('minBedrooms')  ? Number(searchParams.get('minBedrooms'))  : undefined;
    const maxBedrooms  = searchParams.get('maxBedrooms')  ? Number(searchParams.get('maxBedrooms'))  : undefined;
    const minBathrooms = searchParams.get('minBathrooms') ? Number(searchParams.get('minBathrooms')) : undefined;
    const maxBathrooms = searchParams.get('maxBathrooms') ? Number(searchParams.get('maxBathrooms')) : undefined;
    const minLivingArea = searchParams.get('minLivingArea') ? Number(searchParams.get('minLivingArea')) : undefined;
    const maxLivingArea = searchParams.get('maxLivingArea') ? Number(searchParams.get('maxLivingArea')) : undefined;
    const minLotSize = searchParams.get('minLotSize') ? Number(searchParams.get('minLotSize')) : undefined;
    const maxLotSize = searchParams.get('maxLotSize') ? Number(searchParams.get('maxLotSize')) : undefined;
    const minYearBuilt = searchParams.get('minYearBuilt') ? Number(searchParams.get('minYearBuilt')) : undefined;
    const maxYearBuilt = searchParams.get('maxYearBuilt') ? Number(searchParams.get('maxYearBuilt')) : undefined;
    const maxHoaFee = searchParams.get('maxHoaFee') ? Number(searchParams.get('maxHoaFee')) : undefined;

    const propertyType = searchParams.get('propertyType') || undefined;
    // Normalise comma-separated category (e.g. "house,single-family" → "house")
    const propertyCategoryRaw = searchParams.get('propertyCategory');
    const propertyCategory = propertyCategoryRaw
      ? propertyCategoryRaw.split(',')[0].trim()
      : undefined;

    const hasPool  = searchParams.get('hasPool')  === 'true';
    const hasView  = searchParams.get('hasView')  === 'true';
    const hasOceanView = searchParams.get('hasOceanView') === 'true';
    const isWaterfront = searchParams.get('isWaterfront') === 'true';
    const isNewConstruction = searchParams.get('isNewConstruction') === 'true';
    const isSeniorCommunity = searchParams.get('isSeniorCommunity') === 'true';
    const hasFireplace = searchParams.get('hasFireplace') === 'true';
    const hasGarage = searchParams.get('hasGarage') === 'true';
    const priceReduced = searchParams.get('priceReduced') === 'true';
    const openHousesOnly = searchParams.get('openHousesOnly') === 'true';
    const requestedOpenHouseDate = searchParams.get('openHouseDate') || undefined;
    const openHouseDate = requestedOpenHouseDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedOpenHouseDate)
      ? requestedOpenHouseDate
      : undefined;
    const keywords = searchParams.get('keywords') || undefined;
    const locationKeywords = searchParams.get('locationKeywords') || undefined;
    const sortBy   = searchParams.get('sortBy')   || 'updated';

    const minLat = searchParams.get('minLat') != null ? Number(searchParams.get('minLat')) : undefined;
    const maxLat = searchParams.get('maxLat') != null ? Number(searchParams.get('maxLat')) : undefined;
    const minLng = searchParams.get('minLng') != null ? Number(searchParams.get('minLng')) : undefined;
    const maxLng = searchParams.get('maxLng') != null ? Number(searchParams.get('maxLng')) : undefined;
    const hasBbox = [minLat, maxLat, minLng, maxLng].every((n) => n != null && Number.isFinite(n));

    const daysListed = searchParams.get('daysListed') ? Number(searchParams.get('daysListed')) : undefined;

    const maxLimit = hasBbox ? 500 : 100;
    const rawLimit = searchParams.get('limit') ? Number(searchParams.get('limit')) : (hasBbox ? 300 : 20);
    const limit    = Math.min(Math.max(1, rawLimit), maxLimit);

    // Pagination mode — cursor wins when present
    const cursorParam = searchParams.get('cursor') || undefined;
    const rawOffset   = searchParams.get('offset') ? Number(searchParams.get('offset')) : 0;
    const offset      = Math.max(0, rawOffset);

    // ── Full state name passed as city → treat as state filter ───────────────
    const knownStates: Record<string, string> = {
      california: 'CA', 'new york': 'NY', texas: 'TX', florida: 'FL',
    };
    const normalizedCity  = city?.toLowerCase();
    const cityIsStateName = normalizedCity ? knownStates[normalizedCity] : undefined;

    // ── sortBy → repository sort token ──────────────────────────────────────
    const mapSort = (
      s: string
    ): 'price_asc' | 'price_desc' | 'newest' | 'updated' | 'area_desc' => {
      switch (s) {
        case 'recommended': return 'updated';
        case 'date-desc':
        case 'newest':      return 'newest';
        case 'price-asc':   return 'price_asc';
        case 'price-desc':  return 'price_desc';
        case 'area-desc':   return 'area_desc';
        default:            return 'updated';
      }
    };

    // ── Redis cache lookup ───────────────────────────────────────────────────
    const cacheKey = buildSearchCacheKey(searchParams);
    const cacheTags = [PROPERTY_CACHE_TAG, 'property-search'];
    const runtimeCached = await getRuntimeJson<PropertySearchPayload>(cacheKey);
    if (runtimeCached) {
      const response = applyPublicCacheHeaders(NextResponse.json(runtimeCached), {
        ...PROPERTY_SEARCH_CACHE,
        tags: cacheTags,
        status: 'VERCEL_RUNTIME_HIT',
      });
      appendServerTiming(response, {
        total: { durationMs: performance.now() - requestStartedAt },
        cache: { description: 'VERCEL_RUNTIME_HIT' },
      });
      return response;
    }

    const redisCached = await rjson<PropertySearchPayload>(cacheKey);
    if (redisCached) {
      await setRuntimeJson(cacheKey, redisCached, {
        ttlSeconds: PROPERTY_SEARCH_CACHE.ttlSeconds,
        tags: cacheTags,
        name: 'property-search',
      });

      const response = applyPublicCacheHeaders(NextResponse.json(redisCached), {
        ...PROPERTY_SEARCH_CACHE,
        tags: cacheTags,
        status: 'REDIS_HIT',
      });
      appendServerTiming(response, {
        total: { durationMs: performance.now() - requestStartedAt },
        cache: { description: 'REDIS_HIT' },
      });
      return response;
    }

    // ── Execute search ───────────────────────────────────────────────────────
    // Cursor mode: keyset pagination — safe for live data, no COUNT(*) query.
    // Offset mode: legacy integer offset — kept for backward compat.
    const sharedParams = {
      city:             county ? undefined : (cityIsStateName ? undefined : city),
      county,
      state:            state || (cityIsStateName ? knownStates[normalizedCity!] : undefined),
      status,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      maxBathrooms,
      minLivingArea,
      maxLivingArea,
      minLotSize,
      maxLotSize,
      minYearBuilt,
      maxYearBuilt,
      maxHoaFee,
      propertyType:     propertyType === 'All' ? undefined : propertyType,
      propertyCategory,
      keywords,
      locationKeywords,
      hasPool:          hasPool  || undefined,
      hasView:          hasView  || undefined,
      hasOceanView:     hasOceanView || undefined,
      isWaterfront:     isWaterfront || undefined,
      isNewConstruction: isNewConstruction || undefined,
      isSeniorCommunity: isSeniorCommunity || undefined,
      hasFireplace:     hasFireplace || undefined,
      hasGarage:        hasGarage || undefined,
      priceReduced:     priceReduced || undefined,
      openHousesOnly:   openHousesOnly || undefined,
      openHouseDate,
      daysListed,
      limit,
      ...(hasBbox ? { minLat: minLat!, maxLat: maxLat!, minLng: minLng!, maxLng: maxLng! } : {}),
    };

    let data: ReturnType<typeof shapeProperty>[];
    let paginationMeta: Record<string, unknown>;
    const databaseStartedAt = performance.now();

    if (cursorParam !== undefined) {
      // ── Cursor path ──────────────────────────────────────────────────────
      const cursorResult = await searchPropertiesCursor(sharedParams, cursorParam || undefined);
      data = cursorResult.properties.map(shapeProperty);
      paginationMeta = {
        limit,
        hasMore:    cursorResult.hasMore,
        nextCursor: cursorResult.nextCursor,
        // total is not available in cursor mode (no COUNT query)
        total:      null,
        mode:       'cursor',
      };
    } else {
      // ── Offset path (legacy) ─────────────────────────────────────────────
      const offsetResult = await searchProperties({ ...sharedParams, offset, sort: mapSort(sortBy) });
      data = offsetResult.properties.map(shapeProperty);
      paginationMeta = {
        total:          offsetResult.total,
        limit,
        offset,
        hasMore:        offsetResult.hasMore,
        totalEstimated: (offsetResult as any).totalEstimated ?? false,
        mode:           'offset',
      };
    }
    const databaseDurationMs = performance.now() - databaseStartedAt;
    recordDatabaseTiming('property.search', databaseDurationMs);

    // ── Write-through cache ──────────────────────────────────────────
    // Writes are awaited so the serverless invocation fully warms the cache.
    const payload: PropertySearchPayload = {
      success: true,
      data,
      pagination: paginationMeta,
    };
    await Promise.all([
      rset(cacheKey, JSON.stringify(payload), PROPERTY_SEARCH_CACHE.ttlSeconds),
      setRuntimeJson(cacheKey, payload, {
        ttlSeconds: PROPERTY_SEARCH_CACHE.ttlSeconds,
        tags: cacheTags,
        name: 'property-search',
      }),
    ]);

    const response = applyPublicCacheHeaders(NextResponse.json(payload), {
      ...PROPERTY_SEARCH_CACHE,
      tags: cacheTags,
      status: 'MISS',
    });
    appendServerTiming(response, {
      total: { durationMs: performance.now() - requestStartedAt },
      database: { durationMs: databaseDurationMs },
      cache: { description: 'MISS' },
    });
    return response;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Properties API error:', { message: msg });

    const response = NextResponse.json(
      { success: false, error: 'Failed to fetch properties' },
      { status: 500 }
    );
    appendServerTiming(response, {
      total: { durationMs: performance.now() - requestStartedAt },
    });
    return response;
  }
}
