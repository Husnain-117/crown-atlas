/**
 * Single source of truth for city-level metrics (active listings, median price).
 * Uses the SAME filters as searchProperties so hero, city cards, and detail pages
 * always show identical counts and median price. Case-safe and slug-safe.
 */

import { cache } from "react"
import { getPool, isDatabaseConfigured } from "@/lib/db"
import { getCityBySlug, getCounty, getCountyCities } from "@/lib/counties"
import { withDbSemaphore } from "@/lib/db-semaphore"

/** Same exclusion list as property-repo searchProperties for for_sale */
const BUY_PROPERTY_TYPE_WHERE =
  "property_type NOT IN ('Land', 'ResidentialLease', 'CommercialLease', 'CommercialSale', 'BusinessOpportunity')"

/** Same filter as property-repo for for_rent */
const RENT_PROPERTY_TYPE_WHERE =
  "(LOWER(property_type) = 'residentiallease' OR LOWER(property_type) = 'residential lease')"

export interface CityMetricsBuy {
  activeListings: number
  medianPrice: number | null
}

export interface CityMetricsRent {
  activeListings: number
  medianPrice: number | null
}

export type CityMetricsResult = { activeListings: number; medianPrice: number | null; newListings7d?: number; medianPricePerSqft?: number | null; medianDaysOnMarket?: number | null; snapshotAt?: string; available?: boolean }

/** Single source of truth: sale + rent metrics in one DB round-trip. Use for city cards and any place that needs both. */
export interface CityListingMetrics {
  totalSales: number
  totalRentals: number
  medianSalePrice: number | null
  medianRentPrice: number | null
}

function shouldSkipDatabaseMetricsQuery(): boolean {
  return !isDatabaseConfigured()
}

/**
 * Single source of truth: returns sale and rent counts and medians in ONE query per city.
 * Same filters as searchProperties (Active, property type, state=CA, exact city).
 * Use for: county city cards, verification script. City detail pages can use getCityMetrics for one action.
 */
export async function getCityListingMetrics(params: {
  citySlug: string
  countySlug?: string
}): Promise<CityListingMetrics> {
  if (shouldSkipDatabaseMetricsQuery()) {
    return { totalSales: 0, totalRentals: 0, medianSalePrice: null, medianRentPrice: null }
  }

  const city = getCityBySlug(params.citySlug)
  if (!city) {
    return { totalSales: 0, totalRentals: 0, medianSalePrice: null, medianRentPrice: null }
  }
  if (params.countySlug) {
    const countyCities = getCountyCities(params.countySlug)
    const inCounty = countyCities.some((c) => c.slug.toLowerCase() === params.citySlug.toLowerCase())
    if (!inCounty) {
      return { totalSales: 0, totalRentals: 0, medianSalePrice: null, medianRentPrice: null }
    }
  }

  // Normal cities always use the MLS city field. ZIP boundaries often cross
  // city limits and previously inflated city landing-page totals.
  // San Francisco "neighborhoods" share `city = 'San Francisco'`,
  //   while the neighborhood/district lives in `subdivision_name`.
  const queryParams: (string | string[])[] = []
  const addParam = (val: string | string[]): number => {
    queryParams.push(val)
    return queryParams.length
  }

  let whereClause: string
  const countySlugLower = params.countySlug?.toLowerCase()
  const isSfNeighborhoodCard =
    countySlugLower === "san-francisco" &&
    (!city.zipCodes || city.zipCodes.length === 0) &&
    city.slug.toLowerCase() !== "san-francisco-ca"

  if (isSfNeighborhoodCard) {
    const sfCityIndex = addParam("San Francisco")
    const neighborhoodIndex = addParam(`%${city.name}%`)
    // Match neighborhood via subdivision_name using the same column/approach as searchProperties(neighborhood)
    whereClause = `AND LOWER(city) = LOWER($${sfCityIndex}) AND LOWER(subdivision_name) LIKE LOWER($${neighborhoodIndex})`
  } else {
    const cityIndex = addParam(city.name)
    whereClause = `AND LOWER(city) = LOWER($${cityIndex})`
  }
  if (params.countySlug) {
    const county = getCounty(params.countySlug)
    if (county) {
      const countyIndex = addParam(county.name.replace(/\s+County$/i, "").trim())
      whereClause += ` AND LOWER(TRIM(REGEXP_REPLACE(COALESCE(county_or_parish, ''), '\\s+county$', '', 'i'))) = LOWER($${countyIndex})`
    }
  }

  const sql = `
    SELECT
      COUNT(*) FILTER (WHERE property_type NOT IN ('Land', 'ResidentialLease', 'CommercialLease', 'CommercialSale', 'BusinessOpportunity'))::int AS sale_count,
      COUNT(*) FILTER (WHERE (LOWER(property_type) = 'residentiallease' OR LOWER(property_type) = 'residential lease'))::int AS rent_count,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY list_price) FILTER (WHERE property_type NOT IN ('Land', 'ResidentialLease', 'CommercialLease', 'CommercialSale', 'BusinessOpportunity') AND list_price IS NOT NULL AND list_price > 0)::numeric AS median_sale,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY list_price) FILTER (WHERE (LOWER(property_type) = 'residentiallease' OR LOWER(property_type) = 'residential lease') AND list_price IS NOT NULL AND list_price > 0)::numeric AS median_rent
    FROM properties
    WHERE standard_status = 'Active'
      AND (
        property_type NOT IN ('Land', 'ResidentialLease', 'CommercialLease', 'CommercialSale', 'BusinessOpportunity')
        OR (LOWER(property_type) = 'residentiallease' OR LOWER(property_type) = 'residential lease')
      )
      AND LOWER(COALESCE(state_or_province, '')) = 'ca'
      ${whereClause}
  `
  
  // Execute query with semaphore protection to prevent pool exhaustion
  // Retry only on true transient errors, not connection pool exhaustion
  const maxRetries = 1 // Reduced from 2 to prevent retry storms
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await withDbSemaphore(async () => {
        const pool = await getPool()
        return pool.query(sql, queryParams)
      })
      
      const row = result.rows[0] as any
      
      if (!row) {
        return { totalSales: 0, totalRentals: 0, medianSalePrice: null, medianRentPrice: null }
      }
      
      const totalSales = row?.sale_count != null ? parseInt(String(row.sale_count), 10) : 0
      const totalRentals = row?.rent_count != null ? parseInt(String(row.rent_count), 10) : 0
      const medianSalePrice =
        row?.median_sale != null && Number.isFinite(Number(row.median_sale)) ? Math.round(Number(row.median_sale)) : null
      const medianRentPrice =
        row?.median_rent != null && Number.isFinite(Number(row.median_rent)) ? Math.round(Number(row.median_rent)) : null
      
      return { totalSales, totalRentals, medianSalePrice, medianRentPrice }
    } catch (err) {
      const errorMessage = (err as Error).message?.toLowerCase() || ''
      const isCircuitOpen = errorMessage.includes('circuit breaker is open')
      const isQueueTimeout = errorMessage.includes('semaphore queue timeout')
      const isTransientError = errorMessage.includes('connection') && !isQueueTimeout
      
      const isLastAttempt = attempt === maxRetries
      
      // Don't retry if circuit is open or queue timeout (system overload)
      if (isCircuitOpen || isQueueTimeout || isLastAttempt) {
        if (isCircuitOpen || isQueueTimeout) {
          console.warn(`[getCityListingMetrics] ${params.citySlug}: ${errorMessage.slice(0, 100)}`)
        } else {
          console.error(`[getCityListingMetrics] Failed for ${params.citySlug}:`, err)
        }
        return { totalSales: 0, totalRentals: 0, medianSalePrice: null, medianRentPrice: null }
      }
      
      // Only retry on true transient connection errors
      if (isTransientError) {
        const delayMs = (attempt + 1) * 500 // Increased backoff
        await new Promise(resolve => setTimeout(resolve, delayMs))
      } else {
        // Don't retry non-transient errors
        console.error(`[getCityListingMetrics] Non-retryable error for ${params.citySlug}:`, err)
        return { totalSales: 0, totalRentals: 0, medianSalePrice: null, medianRentPrice: null }
      }
    }
  }
  
  return { totalSales: 0, totalRentals: 0, medianSalePrice: null, medianRentPrice: null }
}

/**
 * Single source of truth: one aggregation per call. Use for hero, city cards, detail pages.
 * When countySlug is provided, validates that the city belongs to that county.
 */
// Standalone maintenance scripts use React 18 without the RSC cache export.
const requestCache: typeof cache = typeof cache === "function" ? cache : (fn => fn)
const getCityMetricsCached = requestCache(async (
  citySlug: string, countySlug: string | undefined, action: "buy" | "rent"
): Promise<CityMetricsResult> => {
  const params = { citySlug, countySlug }
  if (shouldSkipDatabaseMetricsQuery()) {
    return { activeListings: 0, medianPrice: null, newListings7d: 0, available: false }
  }

  const city = getCityBySlug(params.citySlug)
  if (!city) {
    return { activeListings: 0, medianPrice: null, available: false }
  }
  if (params.countySlug) {
    const countyCities = getCountyCities(params.countySlug)
    const inCounty = countyCities.some((c) => c.slug.toLowerCase() === params.citySlug.toLowerCase())
    if (!inCounty) {
      return { activeListings: 0, medianPrice: null, available: false }
    }
  }

  const propertyWhere = action === "buy" ? BUY_PROPERTY_TYPE_WHERE : RENT_PROPERTY_TYPE_WHERE
  // Same SF neighborhood handling as getCityListingMetrics:
  // neighborhoods live under `city='San Francisco'` and are distinguished by subdivision_name.
  const queryParams: (string | string[])[] = []
  const addParam = (val: string | string[]): number => {
    queryParams.push(val)
    return queryParams.length
  }

  let whereClause: string
  const countySlugLower = params.countySlug?.toLowerCase()
  const isSfNeighborhoodCard =
    countySlugLower === "san-francisco" &&
    (!city.zipCodes || city.zipCodes.length === 0) &&
    city.slug.toLowerCase() !== "san-francisco-ca"

  if (isSfNeighborhoodCard) {
    const sfCityIndex = addParam("San Francisco")
    const neighborhoodIndex = addParam(`%${city.name.split(",")[0].trim()}%`)
    whereClause = `AND LOWER(city) = LOWER($${sfCityIndex}) AND LOWER(subdivision_name) LIKE LOWER($${neighborhoodIndex})`
  } else {
    const cityIndex = addParam(city.name)
    whereClause = `AND LOWER(city) = LOWER($${cityIndex})`
  }
  if (params.countySlug) {
    const county = getCounty(params.countySlug)
    if (county) {
      const countyIndex = addParam(county.name.replace(/\s+County$/i, "").trim())
      whereClause += ` AND LOWER(TRIM(REGEXP_REPLACE(COALESCE(county_or_parish, ''), '\\s+county$', '', 'i'))) = LOWER($${countyIndex})`
    }
  }

  const sql = `
    SELECT
      COUNT(*)::int AS active_listings,
      COUNT(*) FILTER (
        WHERE COALESCE(on_market_date, listing_contract_date) >= NOW() - INTERVAL '7 days'
      )::int AS new_listings_7d,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY list_price) FILTER (WHERE list_price IS NOT NULL AND list_price > 0)::numeric AS median_price,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY list_price / NULLIF(living_area, 0)) FILTER (WHERE list_price > 0 AND living_area > 0)::numeric AS median_price_sqft,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days_on_market) FILTER (WHERE days_on_market >= 0)::numeric AS median_dom,
      CURRENT_TIMESTAMP AS snapshot_at
    FROM properties
    WHERE standard_status = 'Active'
      AND ${propertyWhere}
      AND LOWER(COALESCE(state_or_province, '')) = 'ca'
      ${whereClause}
  `

  try {
    const result = await withDbSemaphore(async () => {
      const pool = await getPool()
      return pool.query(sql, queryParams)
    })
    
    const row = result.rows[0]
    const activeListings = row?.active_listings != null ? parseInt(String(row.active_listings), 10) : 0
    const medianPrice =
      row?.median_price != null && Number.isFinite(Number(row.median_price))
        ? Math.round(Number(row.median_price))
        : null
    const newListings7d = row?.new_listings_7d != null ? parseInt(String(row.new_listings_7d), 10) : 0
    const numericOrNull = (value: unknown) => value != null && Number.isFinite(Number(value)) ? Math.round(Number(value)) : null
    return { activeListings, medianPrice, newListings7d,
      medianPricePerSqft: numericOrNull(row?.median_price_sqft),
      medianDaysOnMarket: numericOrNull(row?.median_dom),
      snapshotAt: row?.snapshot_at ? new Date(row.snapshot_at).toISOString() : undefined,
      available: true,
    }
  } catch (err) {
    const errorMessage = (err as Error).message?.toLowerCase() || ''
    if (errorMessage.includes('circuit breaker') || errorMessage.includes('semaphore queue')) {
      console.warn(`[getCityMetrics] ${params.citySlug} ${action}: ${errorMessage.slice(0, 80)}`)
    } else {
      console.error(`[getCityMetrics] ${params.citySlug} ${action}:`, err)
    }
    return { activeListings: 0, medianPrice: null, available: false }
  }
})

// Primitive cache keys share a single aggregation across metadata, hero and stats
// in the same server render, even when callers construct separate params objects.
export function getCityMetrics(params: { citySlug: string; countySlug?: string }, action: "buy" | "rent"): Promise<CityMetricsResult> {
  return getCityMetricsCached(params.citySlug, params.countySlug, action)
}

/**
 * Get buy metrics for a city by slug. Uses the exact same filters as searchProperties
 * (status=Active, property type exclusions, city or postal codes, state=CA).
 * Use this for: hero "Active Listings", stats section, city cards, and any displayed count/median.
 */
export async function getCityMetricsBuy(citySlug: string): Promise<CityMetricsBuy> {
  return getCityMetrics({ citySlug }, "buy")
}

/**
 * Get rent metrics (active rental count) for a city by slug. Same location filter as buy.
 */
export async function getCityMetricsRent(citySlug: string): Promise<CityMetricsRent> {
  return getCityMetrics({ citySlug }, "rent")
}

/**
 * Single source of truth: returns sale and rent counts and medians in ONE query for an entire county.
 */
export async function getCountyListingMetrics(countyName: string): Promise<CityListingMetrics> {
  if (shouldSkipDatabaseMetricsQuery()) {
    return { totalSales: 0, totalRentals: 0, medianSalePrice: null, medianRentPrice: null }
  }

  const baseName = countyName.replace(/\s+County$/i, "").trim();
  const queryParams = [baseName];

  const sql = `
    SELECT
      COUNT(*) FILTER (WHERE property_type NOT IN ('Land', 'ResidentialLease', 'CommercialLease', 'CommercialSale', 'BusinessOpportunity'))::int AS sale_count,
      COUNT(*) FILTER (WHERE (LOWER(property_type) = 'residentiallease' OR LOWER(property_type) = 'residential lease'))::int AS rent_count,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY list_price) FILTER (WHERE property_type NOT IN ('Land', 'ResidentialLease', 'CommercialLease', 'CommercialSale', 'BusinessOpportunity') AND list_price IS NOT NULL AND list_price > 0)::numeric AS median_sale,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY list_price) FILTER (WHERE (LOWER(property_type) = 'residentiallease' OR LOWER(property_type) = 'residential lease') AND list_price IS NOT NULL AND list_price > 0)::numeric AS median_rent
    FROM properties
    WHERE standard_status = 'Active'
      AND (
        property_type NOT IN ('Land', 'ResidentialLease', 'CommercialLease', 'CommercialSale', 'BusinessOpportunity')
        OR (LOWER(property_type) = 'residentiallease' OR LOWER(property_type) = 'residential lease')
      )
      AND LOWER(COALESCE(state_or_province, '')) = 'ca'
      AND LOWER(TRIM(REGEXP_REPLACE(COALESCE(county_or_parish, ''), '\\s+county$', '', 'i'))) = LOWER($1)
  `;

  try {
    const result = await withDbSemaphore(async () => {
      const pool = await getPool();
      return pool.query(sql, queryParams);
    });

    const row = result.rows[0];
    if (!row) {
      return { totalSales: 0, totalRentals: 0, medianSalePrice: null, medianRentPrice: null };
    }

    return {
      totalSales: row.sale_count || 0,
      totalRentals: row.rent_count || 0,
      medianSalePrice: row.median_sale ? Math.round(Number(row.median_sale)) : null,
      medianRentPrice: row.median_rent ? Math.round(Number(row.median_rent)) : null,
    };
  } catch (err) {
    console.error(`[getCountyListingMetrics] Error for ${countyName}:`, err);
    return { totalSales: 0, totalRentals: 0, medianSalePrice: null, medianRentPrice: null };
  }
}

export type CountyMetricsResult = CityMetricsResult & {
  totalRent?: number;
  avgPricePerSqFt?: number | null;
  avgDaysOnMarket?: number | null;
  housesCount?: number;
  condosCount?: number;
  under1mCount?: number;
  poolCount?: number;
}

/**
 * Single source of truth: returns comprehensive metrics for an entire county in one query.
 */
export async function getCountyMetrics(countyName: string): Promise<CountyMetricsResult> {
  if (shouldSkipDatabaseMetricsQuery()) {
    return { activeListings: 0, medianPrice: null, newListings7d: 0 }
  }

  const baseName = countyName.replace(/\s+County$/i, "").trim();

  // Property categorization logic matching searchProperties
  const houseSubTypes = ['singlefamilyresidence', 'cabin', 'duplex', 'triplex', 'quadruplex', 'farm', 'mixeduse'];
  const condoSubTypes = ['condominium', 'stockcooperative', 'studio', 'loft', 'coownership', 'ownyourown', 'timeshare', 'boatslip'];

  const sql = `
    SELECT
      COUNT(*)::int AS active_listings,
      COUNT(*) FILTER (
        WHERE COALESCE(on_market_date, listing_contract_date) >= NOW() - INTERVAL '7 days'
      )::int AS new_listings_7d,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY list_price) FILTER (WHERE list_price IS NOT NULL AND list_price > 0)::numeric AS median_price,
      AVG(list_price / NULLIF(living_area, 0)) FILTER (WHERE list_price > 0 AND living_area > 0)::numeric AS avg_price_sqft,
      AVG(days_on_market) FILTER (WHERE days_on_market >= 0)::numeric AS avg_dom,
      COUNT(*) FILTER (WHERE REPLACE(LOWER(property_sub_type), ' ', '') = ANY($2))::int AS houses_count,
      COUNT(*) FILTER (WHERE REPLACE(LOWER(property_sub_type), ' ', '') = ANY($3))::int AS condos_count,
      COUNT(*) FILTER (WHERE list_price < 1000000 AND list_price > 0)::int AS under_1m_count,
      COUNT(*) FILTER (WHERE pool_private_yn = true)::int AS pool_count,
      COUNT(*) FILTER (WHERE (LOWER(property_type) = 'residentiallease' OR LOWER(property_type) = 'residential lease'))::int AS total_rent
    FROM properties
    WHERE standard_status = 'Active'
      AND (
        property_type NOT IN ('Land', 'ResidentialLease', 'CommercialLease', 'CommercialSale', 'BusinessOpportunity')
        OR (LOWER(property_type) = 'residentiallease' OR LOWER(property_type) = 'residential lease')
      )
      AND LOWER(COALESCE(state_or_province, '')) = 'ca'
      AND LOWER(TRIM(REGEXP_REPLACE(COALESCE(county_or_parish, ''), '\\s+county$', '', 'i'))) = LOWER($1)
  `;

  try {
    const result = await withDbSemaphore(async () => {
      const pool = await getPool();
      return pool.query(sql, [baseName, houseSubTypes, condoSubTypes]);
    });

    const row = result.rows[0];
    if (!row) {
      return { activeListings: 0, medianPrice: null, newListings7d: 0 };
    }

    return {
      activeListings: row.active_listings || 0,
      medianPrice: row.median_price ? Math.round(Number(row.median_price)) : null,
      newListings7d: row.new_listings_7d || 0,
      avgPricePerSqFt: row.avg_price_sqft ? Math.round(Number(row.avg_price_sqft)) : null,
      avgDaysOnMarket: row.avg_dom ? Math.round(Number(row.avg_dom)) : null,
      housesCount: row.houses_count || 0,
      condosCount: row.condos_count || 0,
      under1mCount: row.under_1m_count || 0,
      poolCount: row.pool_count || 0,
      totalRent: row.total_rent || 0,
    };
  } catch (err) {
    console.error(`[getCountyMetrics] Error for ${countyName}:`, err);
    return { activeListings: 0, medianPrice: null, newListings7d: 0 };
  }
}
