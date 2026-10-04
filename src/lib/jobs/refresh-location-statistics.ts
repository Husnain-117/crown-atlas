import type { Pool } from "pg"
import { COUNTIES } from "@/lib/counties"
import { getPool } from "@/lib/db"

const ACTIVE_SALE_WHERE = `
  standard_status = 'Active'
  AND property_type NOT IN (
    'Land', 'ResidentialLease', 'CommercialLease', 'CommercialSale', 'BusinessOpportunity'
  )
  AND LOWER(COALESCE(state_or_province, '')) = 'ca'
`

const NORMALIZED_COUNTY =
  "LOWER(TRIM(REGEXP_REPLACE(COALESCE(county_or_parish, ''), '\\s+county$', '', 'i')))"

export interface LocationStatisticsRefreshResult {
  locations: number
  activeListings: number
  refreshedAt: string
  durationMs: number
}

export async function refreshLocationStatistics(
  providedPool?: Pool
): Promise<LocationStatisticsRefreshResult> {
  const startedAt = Date.now()
  const pool = providedPool ?? await getPool()
  await seedLocationDimensions(pool)

  const result = await pool.query<{ locations: number; active_listings: string }>(`
    WITH active AS (
      SELECT
        ${NORMALIZED_COUNTY} AS county_name,
        LOWER(TRIM(city)) AS city_name,
        COUNT(*)::int AS active_listings,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY list_price)
          FILTER (WHERE list_price > 0)::numeric AS median_price,
        AVG(list_price) FILTER (WHERE list_price > 0)::numeric AS avg_price,
        MIN(list_price) FILTER (WHERE list_price > 0)::numeric AS min_price,
        MAX(list_price) FILTER (WHERE list_price > 0)::numeric AS max_price,
        AVG(list_price / NULLIF(living_area, 0))
          FILTER (WHERE list_price > 0 AND living_area > 0)::numeric AS price_per_sqft,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days_on_market)
          FILTER (WHERE days_on_market >= 0)::numeric AS median_days_on_market,
        AVG(days_on_market) FILTER (WHERE days_on_market >= 0)::numeric AS avg_days_on_market,
        COUNT(*) FILTER (WHERE REPLACE(LOWER(COALESCE(property_sub_type, '')), ' ', '') IN ('singlefamilyresidence','cabin','farm'))::int AS houses_count,
        COUNT(*) FILTER (WHERE REPLACE(LOWER(COALESCE(property_sub_type, '')), ' ', '') IN ('condominium','stockcooperative','loft','coownership','ownyourown'))::int AS condos_count,
        COUNT(*) FILTER (WHERE REPLACE(LOWER(COALESCE(property_sub_type, '')), ' ', '') = 'townhouse')::int AS townhomes_count,
        COUNT(*) FILTER (WHERE list_price > 0 AND list_price < 300000)::int AS under_300k_count,
        COUNT(*) FILTER (WHERE list_price >= 300000 AND list_price < 500000)::int AS under_500k_count,
        COUNT(*) FILTER (WHERE list_price >= 500000 AND list_price < 750000)::int AS under_750k_count,
        COUNT(*) FILTER (WHERE list_price >= 750000 AND list_price < 1000000)::int AS under_1m_count,
        COUNT(*) FILTER (WHERE list_price >= 1000000 AND list_price < 2000000)::int AS under_2m_count,
        COUNT(*) FILTER (WHERE list_price >= 2000000)::int AS over_2m_count,
        COUNT(*) FILTER (WHERE pool_private_yn = TRUE)::int AS pool_count,
        COUNT(*) FILTER (WHERE waterfront_yn = TRUE)::int AS waterfront_count,
        COUNT(*) FILTER (
          WHERE LOWER(COALESCE(view, '')) ~ '(ocean|coast|water|bay|harbor|sea)'
             OR LOWER(COALESCE(public_remarks, '')) ~ '(ocean view|coastal view|water view|bay view|harbor view|sea view)'
        )::int AS ocean_view_count,
        COUNT(*) FILTER (WHERE COALESCE(garage_spaces, 0) > 0)::int AS garage_count,
        COUNT(*) FILTER (WHERE COALESCE(on_market_date, listing_contract_date) >= NOW() - INTERVAL '7 days')::int AS new_listings_7d,
        COUNT(*) FILTER (WHERE COALESCE(on_market_date, listing_contract_date) >= NOW() - INTERVAL '30 days')::int AS new_listings_30d
      FROM properties
      WHERE ${ACTIVE_SALE_WHERE}
        AND city IS NOT NULL
        AND TRIM(city) <> ''
      GROUP BY 1, 2
    ),
    closed AS (
      SELECT
        ${NORMALIZED_COUNTY} AS county_name,
        LOWER(TRIM(city)) AS city_name,
        COUNT(*)::int AS sold_30d,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY close_price)
          FILTER (WHERE close_price > 0)::numeric AS median_sale_price_30d,
        AVG(close_price / NULLIF(list_price, 0))
          FILTER (WHERE close_price > 0 AND list_price > 0)::numeric AS sale_to_list_ratio_30d
      FROM properties
      WHERE standard_status IN ('Closed', 'Sold')
        AND close_date >= CURRENT_DATE - INTERVAL '30 days'
        AND property_type NOT IN (
          'Land', 'ResidentialLease', 'CommercialLease', 'CommercialSale', 'BusinessOpportunity'
        )
        AND LOWER(COALESCE(state_or_province, '')) = 'ca'
        AND city IS NOT NULL
      GROUP BY 1, 2
    ),
    refreshed AS (
      INSERT INTO location_market_statistics (
        city_id, active_listings, median_price, avg_price, min_price, max_price,
        price_per_sqft, median_days_on_market, avg_days_on_market,
        houses_count, condos_count, townhomes_count, under_300k_count,
        under_500k_count, under_750k_count, under_1m_count, under_2m_count,
        over_2m_count, pool_count, waterfront_count, ocean_view_count,
        garage_count, new_listings_7d, new_listings_30d, sold_30d,
        median_sale_price_30d, sale_to_list_ratio_30d, months_supply,
        data_source, stats_version, last_updated
      )
      SELECT
        city.city_id,
        COALESCE(active.active_listings, 0),
        active.median_price,
        active.avg_price,
        active.min_price,
        active.max_price,
        active.price_per_sqft,
        active.median_days_on_market,
        active.avg_days_on_market,
        COALESCE(active.houses_count, 0),
        COALESCE(active.condos_count, 0),
        COALESCE(active.townhomes_count, 0),
        COALESCE(active.under_300k_count, 0),
        COALESCE(active.under_500k_count, 0),
        COALESCE(active.under_750k_count, 0),
        COALESCE(active.under_1m_count, 0),
        COALESCE(active.under_2m_count, 0),
        COALESCE(active.over_2m_count, 0),
        COALESCE(active.pool_count, 0),
        COALESCE(active.waterfront_count, 0),
        COALESCE(active.ocean_view_count, 0),
        COALESCE(active.garage_count, 0),
        COALESCE(active.new_listings_7d, 0),
        COALESCE(active.new_listings_30d, 0),
        COALESCE(closed.sold_30d, 0),
        closed.median_sale_price_30d,
        closed.sale_to_list_ratio_30d,
        CASE
          WHEN COALESCE(closed.sold_30d, 0) > 0
          THEN COALESCE(active.active_listings, 0)::numeric / closed.sold_30d
          ELSE NULL
        END,
        'CRMLS',
        2,
        NOW()
      FROM location_cities AS city
      JOIN location_counties AS county ON county.county_id = city.county_id
      LEFT JOIN active
        ON active.county_name = LOWER(REGEXP_REPLACE(county.county_name, '\\s+county$', '', 'i'))
       AND active.city_name = LOWER(city.city_name)
      LEFT JOIN closed
        ON closed.county_name = LOWER(REGEXP_REPLACE(county.county_name, '\\s+county$', '', 'i'))
       AND closed.city_name = LOWER(city.city_name)
      WHERE city.location_type = 'city'
      ON CONFLICT (city_id) DO UPDATE SET
        active_listings = EXCLUDED.active_listings,
        median_price = EXCLUDED.median_price,
        avg_price = EXCLUDED.avg_price,
        min_price = EXCLUDED.min_price,
        max_price = EXCLUDED.max_price,
        price_per_sqft = EXCLUDED.price_per_sqft,
        median_days_on_market = EXCLUDED.median_days_on_market,
        avg_days_on_market = EXCLUDED.avg_days_on_market,
        houses_count = EXCLUDED.houses_count,
        condos_count = EXCLUDED.condos_count,
        townhomes_count = EXCLUDED.townhomes_count,
        under_300k_count = EXCLUDED.under_300k_count,
        under_500k_count = EXCLUDED.under_500k_count,
        under_750k_count = EXCLUDED.under_750k_count,
        under_1m_count = EXCLUDED.under_1m_count,
        under_2m_count = EXCLUDED.under_2m_count,
        over_2m_count = EXCLUDED.over_2m_count,
        pool_count = EXCLUDED.pool_count,
        waterfront_count = EXCLUDED.waterfront_count,
        ocean_view_count = EXCLUDED.ocean_view_count,
        garage_count = EXCLUDED.garage_count,
        new_listings_7d = EXCLUDED.new_listings_7d,
        new_listings_30d = EXCLUDED.new_listings_30d,
        sold_30d = EXCLUDED.sold_30d,
        median_sale_price_30d = EXCLUDED.median_sale_price_30d,
        sale_to_list_ratio_30d = EXCLUDED.sale_to_list_ratio_30d,
        months_supply = EXCLUDED.months_supply,
        data_source = EXCLUDED.data_source,
        stats_version = EXCLUDED.stats_version,
        last_updated = NOW()
      RETURNING active_listings
    )
    SELECT COUNT(*)::int AS locations, COALESCE(SUM(active_listings), 0)::bigint AS active_listings
    FROM refreshed
  `)

  await refreshLegacyCityStatistics(pool)

  return {
    locations: Number(result.rows[0]?.locations ?? 0),
    activeListings: Number(result.rows[0]?.active_listings ?? 0),
    refreshedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
  }
}

async function seedLocationDimensions(pool: Pool): Promise<void> {
  const counties = COUNTIES.map((county) => ({
    county_id: county.slug,
    county_slug: county.slug,
    county_name: county.name,
  }))
  const isNeighborhood = (countySlug: string, citySlug: string): boolean =>
    countySlug === "san-francisco" && citySlug !== "san-francisco-ca"
  const cities = COUNTIES.flatMap((county) => county.cities
    .filter((city) => !isNeighborhood(county.slug, city.slug))
    .map((city) => ({
    city_id: `${county.slug}:${city.slug}`,
    county_id: county.slug,
    city_slug: city.slug,
    city_name: city.name,
    location_type: "city",
  })))
  const neighborhoods = COUNTIES.flatMap((county) => county.cities
    .filter((city) => isNeighborhood(county.slug, city.slug))
    .map((city) => ({
      neighborhood_id: `${county.slug}:san-francisco-ca:${city.slug}`,
      parent_city_id: `${county.slug}:san-francisco-ca`,
      neighborhood_slug: city.slug,
      neighborhood_name: city.name,
      source_field: "subdivision_name",
      match_pattern: `%${city.name}%`,
      legacy_city_id: `${county.slug}:${city.slug}`,
    })))
  const zipCodes = new Map<string, { zip_id: string; postal_code: string }>()
  const cityZipCodes = new Map<string, { city_id: string; zip_id: string }>()
  for (const county of COUNTIES) {
    for (const city of county.cities) {
      if (isNeighborhood(county.slug, city.slug)) continue
      for (const postalCode of city.zipCodes || []) {
        const zipId = `ca:${postalCode}`
        zipCodes.set(zipId, { zip_id: zipId, postal_code: postalCode })
        cityZipCodes.set(`${county.slug}:${city.slug}:${zipId}`, {
          city_id: `${county.slug}:${city.slug}`,
          zip_id: zipId,
        })
      }
    }
  }

  await pool.query(`
    INSERT INTO location_counties (county_id, county_slug, county_name, state, updated_at)
    SELECT county_id, county_slug, county_name, 'CA', NOW()
    FROM JSONB_TO_RECORDSET($1::jsonb) AS row(county_id TEXT, county_slug TEXT, county_name TEXT)
    ON CONFLICT (county_id) DO UPDATE SET
      county_slug = EXCLUDED.county_slug,
      county_name = EXCLUDED.county_name,
      updated_at = NOW()
  `, [JSON.stringify(counties)])

  await pool.query(`
    INSERT INTO location_cities (
      city_id, county_id, city_slug, city_name, location_type, state, updated_at
    )
    SELECT city_id, county_id, city_slug, city_name, location_type, 'CA', NOW()
    FROM JSONB_TO_RECORDSET($1::jsonb) AS row(
      city_id TEXT, county_id TEXT, city_slug TEXT, city_name TEXT, location_type TEXT
    )
    ON CONFLICT (city_id) DO UPDATE SET
      county_id = EXCLUDED.county_id,
      city_slug = EXCLUDED.city_slug,
      city_name = EXCLUDED.city_name,
      location_type = EXCLUDED.location_type,
      updated_at = NOW()
  `, [JSON.stringify(cities)])

  await pool.query(`
    UPDATE location_cities AS legacy
    SET location_type = 'legacy_neighborhood', updated_at = NOW()
    FROM JSONB_TO_RECORDSET($1::jsonb) AS row(legacy_city_id TEXT)
    WHERE legacy.city_id = row.legacy_city_id
  `, [JSON.stringify(neighborhoods)])

  await pool.query(`
    INSERT INTO location_neighborhoods (
      neighborhood_id, parent_city_id, neighborhood_slug, neighborhood_name,
      source_field, match_pattern, state, updated_at
    )
    SELECT
      neighborhood_id, parent_city_id, neighborhood_slug, neighborhood_name,
      source_field, match_pattern, 'CA', NOW()
    FROM JSONB_TO_RECORDSET($1::jsonb) AS row(
      neighborhood_id TEXT, parent_city_id TEXT, neighborhood_slug TEXT,
      neighborhood_name TEXT, source_field TEXT, match_pattern TEXT
    )
    ON CONFLICT (neighborhood_id) DO UPDATE SET
      parent_city_id = EXCLUDED.parent_city_id,
      neighborhood_slug = EXCLUDED.neighborhood_slug,
      neighborhood_name = EXCLUDED.neighborhood_name,
      source_field = EXCLUDED.source_field,
      match_pattern = EXCLUDED.match_pattern,
      updated_at = NOW()
  `, [JSON.stringify(neighborhoods)])

  await pool.query(`
    INSERT INTO location_zip_codes (zip_id, postal_code, state, updated_at)
    SELECT zip_id, postal_code, 'CA', NOW()
    FROM JSONB_TO_RECORDSET($1::jsonb) AS row(zip_id TEXT, postal_code TEXT)
    ON CONFLICT (zip_id) DO UPDATE SET
      postal_code = EXCLUDED.postal_code,
      updated_at = NOW()
  `, [JSON.stringify(Array.from(zipCodes.values()))])

  await pool.query(`
    INSERT INTO location_city_zip_codes (city_id, zip_id, updated_at)
    SELECT city_id, zip_id, NOW()
    FROM JSONB_TO_RECORDSET($1::jsonb) AS row(city_id TEXT, zip_id TEXT)
    ON CONFLICT (city_id, zip_id) DO UPDATE SET updated_at = NOW()
  `, [JSON.stringify(Array.from(cityZipCodes.values()))])
}

async function refreshLegacyCityStatistics(pool: Pool): Promise<void> {
  await pool.query(`
    WITH preferred AS (
      SELECT DISTINCT ON (city.city_slug)
        city.city_slug,
        city.city_name,
        county.county_slug,
        stats.*
      FROM location_cities AS city
      JOIN location_counties AS county ON county.county_id = city.county_id
      JOIN location_market_statistics AS stats ON stats.city_id = city.city_id
      WHERE city.location_type = 'city'
      ORDER BY city.city_slug, stats.active_listings DESC, city.city_id
    )
    INSERT INTO city_statistics (
      city_name, city_slug, state, total_properties, active_listings,
      median_price, avg_price, min_price, max_price, price_per_sqft,
      median_days_on_market, avg_days_on_market, houses_count, condos_count,
      townhomes_count, under_300k_count, under_500k_count, under_750k_count,
      under_1m_count, under_2m_count, over_2m_count, pool_count,
      waterfront_count, ocean_view_count, garage_count, top_neighborhoods,
      last_updated, data_source, new_listings_30d, city_id, county_slug,
      sold_30d, median_sale_price_30d, sale_to_list_ratio_30d,
      months_supply, stats_version
    )
    SELECT
      city_name, city_slug, 'CA', active_listings, active_listings,
      median_price, avg_price, min_price, max_price, price_per_sqft,
      median_days_on_market, avg_days_on_market, houses_count, condos_count,
      townhomes_count, under_300k_count, under_500k_count, under_750k_count,
      under_1m_count, under_2m_count, over_2m_count, pool_count,
      waterfront_count, ocean_view_count, garage_count, '[]'::jsonb,
      last_updated, data_source, new_listings_30d, city_id, county_slug,
      sold_30d, median_sale_price_30d, sale_to_list_ratio_30d,
      months_supply, stats_version
    FROM preferred
    WHERE NOT EXISTS (
      SELECT 1
      FROM city_statistics AS slug_conflict
      WHERE slug_conflict.city_slug = preferred.city_slug
        AND LOWER(slug_conflict.city_name) <> LOWER(preferred.city_name)
    )
    ON CONFLICT (city_name) DO UPDATE SET
      city_name = EXCLUDED.city_name,
      total_properties = EXCLUDED.total_properties,
      active_listings = EXCLUDED.active_listings,
      median_price = EXCLUDED.median_price,
      avg_price = EXCLUDED.avg_price,
      min_price = EXCLUDED.min_price,
      max_price = EXCLUDED.max_price,
      price_per_sqft = EXCLUDED.price_per_sqft,
      median_days_on_market = EXCLUDED.median_days_on_market,
      avg_days_on_market = EXCLUDED.avg_days_on_market,
      houses_count = EXCLUDED.houses_count,
      condos_count = EXCLUDED.condos_count,
      townhomes_count = EXCLUDED.townhomes_count,
      under_300k_count = EXCLUDED.under_300k_count,
      under_500k_count = EXCLUDED.under_500k_count,
      under_750k_count = EXCLUDED.under_750k_count,
      under_1m_count = EXCLUDED.under_1m_count,
      under_2m_count = EXCLUDED.under_2m_count,
      over_2m_count = EXCLUDED.over_2m_count,
      pool_count = EXCLUDED.pool_count,
      waterfront_count = EXCLUDED.waterfront_count,
      ocean_view_count = EXCLUDED.ocean_view_count,
      garage_count = EXCLUDED.garage_count,
      last_updated = EXCLUDED.last_updated,
      data_source = EXCLUDED.data_source,
      new_listings_30d = EXCLUDED.new_listings_30d,
      city_id = EXCLUDED.city_id,
      county_slug = EXCLUDED.county_slug,
      sold_30d = EXCLUDED.sold_30d,
      median_sale_price_30d = EXCLUDED.median_sale_price_30d,
      sale_to_list_ratio_30d = EXCLUDED.sale_to_list_ratio_30d,
      months_supply = EXCLUDED.months_supply,
      stats_version = EXCLUDED.stats_version
  `)
}
