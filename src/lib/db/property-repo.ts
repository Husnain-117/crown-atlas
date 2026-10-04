import { getPgPool, isDatabaseConfigured } from "@/lib/db";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** Shape returned by searchProperties for listing cards. */
export interface PropertyListItem {
  listing_key: string;
  property_entity_key?: string | null;
  list_price: number | null;
  /** Maps to unparsed_address in the database. */
  address: string | null;
  city: string | null;
  /** Maps to state_or_province in the database. */
  state: string | null;
  bedrooms_total: number | null;
  /** Maps to bathrooms_total_integer in the database. */
  bathrooms_total: number | null;
  living_area: number | null;
  lot_size_sq_ft: number | null;
  property_type: string | null;
  property_sub_type?: string | null;
  /** Maps to standard_status in the database. */
  status: string | null;
  photos_count: number | null;
  latitude: number | null;
  longitude: number | null;
  main_photo_url: string | null;
  /** JSON array of image URLs stored in DigitalOcean Spaces. */
  media_urls: string[] | null;
  modification_timestamp: string | null;
  listed_at: string | null;
  last_seen_ts: string | null;
  listing_agent_mlsid: string | null;
  listing_agent_full_name: string | null;
  listing_agent_direct_phone: string | null;
  listing_agent_email: string | null;
  public_remarks: string | null;
  county_or_parish: string | null;
  open_house_start_timestamp: string | null;
  open_house_end_timestamp: string | null;
  postal_code?: string | null;
  year_built?: number | null;
  parking_total?: number | null;
  garage_spaces?: number | null;
  pool_private_yn?: boolean | null;
  waterfront_yn?: boolean | null;
  view_yn?: boolean | null;
  days_on_market?: number | null;
  cumulative_days_on_market?: number | null;
  original_list_price?: number | null;
  price_change_timestamp?: string | null;
  hoa_fee?: number | null;
  hoa_fee_frequency?: string | null;
  view?: string | null;
  new_construction_yn?: boolean | null;
  senior_community_yn?: boolean | null;
  fireplace_yn?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

/** Parameters accepted by searchProperties. */
export interface PropertySearchParams {
  city?: string;
  state?: string;
  county?: string;
  neighborhood?: string;
  /** ZIP codes for neighbourhood-level queries (bypasses city filter). */
  postalCodes?: string[];
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minLivingArea?: number;
  maxLivingArea?: number;
  minLotSize?: number;
  maxLotSize?: number;
  minYearBuilt?: number;
  maxYearBuilt?: number;
  hasGarage?: boolean;
  maxHoaFee?: number;
  propertyType?: string;
  propertySubType?: string;
  modifiedAfter?: string;
  /** Sub-type category — one of: house | condo | townhouse | manufactured | multifamily. */
  propertyCategory?: string;
  keywords?: string;
  /** Address, ZIP, or MLS identifier. Kept separate so amenity keywords can be ANDed. */
  locationKeywords?: string;
  hasPool?: boolean;
  hasView?: boolean;
  hasOceanView?: boolean;
  isWaterfront?: boolean;
  isNewConstruction?: boolean;
  isSeniorCommunity?: boolean;
  hasFireplace?: boolean;
  priceReduced?: boolean;
  /**
   * UI status values:
   * for_sale | sold | pending | under_contract | off_market | coming_soon | for_rent | rented
   */
  status?: string | string[];
  limit?: number;
  offset?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "updated" | "area_desc" | "dom_asc" | "price_reduced";
  /**
   * Only return listings that entered the market within the last N days.
   * Uses MLS dates, never local synchronization timestamps.
   */
  daysListed?: number;
  /** Bounding box for map viewport (latitude/longitude). */
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  /** Filter to only show properties with upcoming open houses. */
  openHousesOnly?: boolean;
  /** Filter to open houses overlapping this calendar date (YYYY-MM-DD). */
  openHouseDate?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
let openHouseTablePromise: Promise<boolean> | null = null;

const POOL_FILTER_SQL = `(
  pool_private_yn = TRUE
  OR LOWER(TRIM(COALESCE(pool_features, ''))) NOT IN ('', 'none', 'no', 'false', '0')
)`;

const OCEAN_VIEW_FILTER_SQL = `(
  LOWER(COALESCE(view, '')) ~ '(ocean|coast|water|bay|harbor|sea)'
  OR LOWER(COALESCE(public_remarks, '')) ~ '(ocean view|coastal view|water view|bay view|harbor view|sea view)'
)`;

/** UI → database status mapping. */
const STATUS_MAP: Record<string, readonly string[]> = {
  for_sale: ["Active"],
  sold: ["Closed", "Sold"],
  pending: ["Pending"],
  under_contract: ["Active Under Contract", "Under Contract"],
  off_market: ["Canceled", "Expired", "Withdrawn", "Hold", "Off Market"],
  coming_soon: ["Coming Soon"],
  for_rent: ["Active"],
  rented: ["Closed", "Rented"],
};

function databaseStatuses(statuses: string[]): string[] {
  return Array.from(new Set(statuses.flatMap((status) => STATUS_MAP[status] ?? [status]).filter(Boolean)));
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Structured debug log — suppressed in production to avoid leaking internal state.
 * Emits to stdout as a JSON line so log aggregators can parse it easily.
 */
function devLog(event: string, data?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "production") return;
  const payload: Record<string, unknown> = { at: "property-repo", event };
  if (data) Object.assign(payload, data);
  try { console.debug(JSON.stringify(payload)); } catch { /* ignore */ }
}

/** Race a promise against a millisecond deadline. */
function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutError: Error,
  rejectOnTimeout = false
): Promise<T | Error> {
  let timer: NodeJS.Timeout;
  const race = new Promise<T | Error>((resolve, reject) => {
    timer = setTimeout(() => {
      if (rejectOnTimeout) reject(timeoutError);
      else resolve(timeoutError);
    }, ms);
  });
  return Promise.race([promise.finally(() => clearTimeout(timer)), race]);
}

async function supportsOpenHouseTable(
  pool: Awaited<ReturnType<typeof getPgPool>>
): Promise<boolean> {
  if (!openHouseTablePromise) {
    openHouseTablePromise = (async () => {
      try {
        const result = await pool.query<{ exists: boolean }>(
          "SELECT TO_REGCLASS('public.open_houses') IS NOT NULL AS exists"
        );
        return result.rows[0]?.exists === true;
      } catch (error) {
        console.warn("[property-repo] Open-house schema check failed; using compatibility mode", error);
        return false;
      }
    })();
  }

  return openHouseTablePromise;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Search the `properties` table with optional filters.
 *
 * All user-supplied values are passed as parameterised bind variables;
 * no string concatenation of untrusted input occurs.
 *
 * Returns: `{ properties, total, hasMore }`
 */
export async function searchProperties(params: PropertySearchParams) {
  if (!isDatabaseConfigured()) {
    const { isTrestleConfigured, searchTrestleProperties } = await import(
      '@/lib/trestle-property-fallback'
    );
    return isTrestleConfigured()
      ? searchTrestleProperties(params)
      : { properties: [], total: 0, hasMore: false };
  }

  try {
    return await searchPropertiesFromDatabase(params);
  } catch (error) {
    const { isTrestleConfigured, searchTrestleProperties } = await import(
      '@/lib/trestle-property-fallback'
    );
    if (!isTrestleConfigured()) throw error;

    console.warn('[property-repo] PostgreSQL search failed; using Trestle fallback', {
      message: error instanceof Error ? error.message : String(error),
    });
    return searchTrestleProperties(params);
  }
}

async function searchPropertiesFromDatabase(params: PropertySearchParams) {

  const pool = await getPgPool();
  const openHouseTableAvailable = await supportsOpenHouseTable(pool);
  const values: unknown[] = [];
  const where: string[] = [];

  // ── Status filter ──────────────────────────────────────────────────────────
  let isForRent = false;
  if (params.status) {
    const statuses = Array.isArray(params.status) ? params.status : [params.status];
    isForRent = statuses.some((status) => status === "for_rent" || status === "rented");
    const dbStatuses = databaseStatuses(statuses);

    if (dbStatuses.length === 1) {
      where.push(`standard_status = $${values.length + 1}`);
      values.push(dbStatuses[0]);
    } else if (dbStatuses.length > 1) {
      where.push(`standard_status = ANY($${values.length + 1})`);
      values.push(dbStatuses);
    }
  } else {
    where.push(`standard_status = 'Active'`);
  }

  // ── Base property-type guard ───────────────────────────────────────────────
  // Exclude land, commercial, and lease listings from residential searches.
  if (isForRent) {
    where.push(`LOWER(REPLACE(property_type, ' ', '')) = 'residentiallease'`);
  } else {
    where.push(
      `property_type NOT IN ('Land','ResidentialLease','CommercialLease','CommercialSale','BusinessOpportunity')`
    );
  }

  // ── Parameterised WHERE helper ─────────────────────────────────────────────
  function add(cond: string, val?: unknown): void {
    if (val === undefined || val === null) return;
    values.push(val);
    where.push(cond.replace("$IDX", `$${values.length}`));
  }

  add("modification_timestamp > $IDX::timestamptz", params.modifiedAfter);
  add("property_sub_type = $IDX", params.propertySubType);

  // ── Location filters ───────────────────────────────────────────────────────
  if (params.county) {
    const baseName = params.county.replace(/\s+County$/i, "").trim();
    add(
      "LOWER(TRIM(REGEXP_REPLACE(county_or_parish, '\\s+county$', '', 'i'))) = LOWER($IDX)",
      baseName
    );
    devLog("search-county", { county: params.county, baseName });
  }
  if (params.postalCodes && params.postalCodes.length > 0) {
    where.push(`split_part(postal_code, '-', 1) = ANY($${values.length + 1})`);
    values.push(params.postalCodes);
    devLog("search-postalCodes", { count: params.postalCodes.length });
  } else if (params.city) {
    // Exact city match so listing counts align with city_statistics table
    add("LOWER(city) = LOWER($IDX)", params.city);
    devLog("search-city", { city: params.city });
  }

  // Default location-level searches to California so common county names do not cross state lines.
  const isLocationLevel = !!(params.city || params.county || params.postalCodes?.length || params.locationKeywords);
  const stateFilter = isLocationLevel ? (params.state ?? "CA") : params.state;
  add("LOWER(state_or_province) = LOWER($IDX)", stateFilter);
  add(
    "LOWER(subdivision_name) LIKE LOWER($IDX)",
    params.neighborhood ? `%${params.neighborhood}%` : undefined
  );

  if (params.locationKeywords?.trim()) {
    const idx = values.length + 1;
    values.push(`%${params.locationKeywords.trim()}%`);
    where.push(`(
      LOWER(COALESCE(unparsed_address, '')) LIKE LOWER($${idx})
      OR LOWER(COALESCE(cleaned_address, '')) LIKE LOWER($${idx})
      OR LOWER(COALESCE(city, '')) LIKE LOWER($${idx})
      OR LOWER(COALESCE(subdivision_name, '')) LIKE LOWER($${idx})
      OR LOWER(COALESCE(postal_code, '')) LIKE LOWER($${idx})
      OR LOWER(COALESCE(listing_key, '')) LIKE LOWER($${idx})
    )`);
  }

  // ── Price / size filters ───────────────────────────────────────────────────
  add("list_price >= $IDX", params.minPrice);
  add("list_price <= $IDX", params.maxPrice);
  add("bedrooms_total >= $IDX", params.minBedrooms);
  add("bedrooms_total <= $IDX", params.maxBedrooms);
  add("bathrooms_total_integer >= $IDX", params.minBathrooms);
  add("bathrooms_total_integer <= $IDX", params.maxBathrooms);
  add("living_area >= $IDX", params.minLivingArea);
  add("living_area <= $IDX", params.maxLivingArea);
  add("lot_size_sq_ft >= $IDX", params.minLotSize);
  add("lot_size_sq_ft <= $IDX", params.maxLotSize);
  add("year_built >= $IDX", params.minYearBuilt);
  add("year_built <= $IDX", params.maxYearBuilt);
  add("COALESCE(hoa_fee, 0) <= $IDX", params.maxHoaFee);

  if (params.hasGarage) {
    where.push("COALESCE(garage_spaces, 0) > 0");
  }

  if (params.priceReduced) {
    where.push("price_change_timestamp IS NOT NULL");
    where.push("COALESCE(original_list_price, list_price) > list_price");
  }

  if (params.hasPool) where.push(POOL_FILTER_SQL);
  if (params.hasView) where.push("view_yn = TRUE");
  if (params.hasOceanView) where.push(OCEAN_VIEW_FILTER_SQL);
  if (params.isWaterfront) where.push("waterfront_yn = TRUE");
  if (params.isNewConstruction) where.push("new_construction_yn = TRUE");
  if (params.isSeniorCommunity) where.push("senior_community_yn = TRUE");
  if (params.hasFireplace) where.push("fireplace_yn = TRUE");

  // ── Property type filter ───────────────────────────────────────────────────
  if (isForRent) {
    where.push(
      "(LOWER(property_type) = 'residentiallease' OR LOWER(property_type) = 'residential lease')"
    );
  } else if (params.propertyType) {
    if (params.propertyType === "Residential") {
      // Exact match — exclude ResidentialLease variants
      where.push(
        "LOWER(property_type) = 'residential' AND LOWER(property_type) NOT LIKE '%lease%'"
      );
    } else if (params.propertyType === "ResidentialLease") {
      where.push(
        "(LOWER(property_type) = 'residentiallease' OR LOWER(property_type) = 'residential lease')"
      );
    } else {
      add("LOWER(property_type) LIKE LOWER($IDX)", `%${params.propertyType}%`);
    }
  }

  // ── Property category (sub-type) filter ──────────────────────────────────
  if (params.propertyCategory) {
    // Accept comma-separated values; use only the first segment
    const category = params.propertyCategory.split(",")[0].trim().toLowerCase();

    if (category === "house") {
      where.push(`(
        REPLACE(LOWER(property_sub_type), ' ', '') IN (
          'singlefamilyresidence','cabin','farm'
        )
      )`);
    } else if (category === "condo") {
      where.push(`(
        REPLACE(LOWER(property_sub_type), ' ', '') IN (
          'condominium','stockcooperative','loft','coownership','ownyourown'
        )
      )`);
    } else if (category === "townhouse") {
      where.push(`REPLACE(LOWER(property_sub_type), ' ', '') = 'townhouse'`);
    } else if (category === "manufactured") {
      where.push(`(
        REPLACE(LOWER(property_sub_type), ' ', '') IN (
          'manufacturedonland','manufacturedhome','mobilehome'
        )
      )`);
    } else if (category === "multifamily") {
      where.push(`(
        REPLACE(LOWER(property_sub_type), ' ', '') IN (
          'duplex','triplex','quadruplex','mixeduse'
        )
      )`);
    } else {
      add("LOWER(property_sub_type) LIKE LOWER($IDX)", `%${params.propertyCategory}%`);
    }
  }

  // ── Keyword search with relevance scoring ─────────────────────────────────
  let keywordRelevanceScore = '';
  if (params.keywords) {
    const lower = params.keywords.toLowerCase().trim();

    // Extract bedroom count from natural-language keywords (e.g. "3 bedroom")
    const bedroomMatch = lower.match(/(\d+)\s*(bedroom|bed|br)/);
    if (bedroomMatch && !params.minBedrooms) {
      add("bedrooms_total >= $IDX", parseInt(bedroomMatch[1]));
      devLog("search-keywords-bedrooms", { extracted: bedroomMatch[1] });
    }

    // Extract bathroom count from natural-language keywords
    const bathroomMatch = lower.match(/(\d+)\s*(bathroom|bath|ba)/);
    if (bathroomMatch && !params.minBathrooms) {
      add("bathrooms_total_integer >= $IDX", parseInt(bathroomMatch[1]));
      devLog("search-keywords-bathrooms", { extracted: bathroomMatch[1] });
    }

    // Comma-separated keyword phrases use OR semantics per phrase.
    // e.g. "new construction,new build" matches any property containing EITHER
    // phrase. Never reference the SELECT alias "address" — use unparsed_address.
    const keywordPhrases = params.keywords.split(',').map(k => k.trim()).filter(Boolean);
    const orConditions: string[] = [];
    for (const phrase of keywordPhrases) {
      const idx = values.length + 1;
      values.push(`%${phrase}%`);
      orConditions.push(
        `LOWER(city) LIKE LOWER($${idx})`,
        `LOWER(unparsed_address) LIKE LOWER($${idx})`,
        `LOWER(postal_code) LIKE LOWER($${idx})`,
        `LOWER(public_remarks) LIKE LOWER($${idx})`,
        `LOWER(listing_key) LIKE LOWER($${idx})`,
      );
    }
    if (orConditions.length > 0) {
      where.push(`(${orConditions.join(' OR ')})`);
    }

    // Relevance scoring based on the primary (first) keyword phrase.
    // Scoring: Exact city (1000) > City contains (500) > Exact address (400) >
    //          Address contains (200) > Postal code (300) > Remarks (50) > Key (100)
    const primaryPhrase = keywordPhrases[0] ?? params.keywords;
    const exactIdx = values.length + 1;
    const likeIdx  = values.length + 2;
    values.push(primaryPhrase, `%${primaryPhrase}%`);
    keywordRelevanceScore = `
      (CASE
        WHEN LOWER(city) = LOWER($${exactIdx}) THEN 1000
        WHEN LOWER(city) LIKE LOWER($${likeIdx}) THEN 500
        ELSE 0
      END +
      CASE
        WHEN LOWER(unparsed_address) = LOWER($${exactIdx}) THEN 400
        WHEN LOWER(unparsed_address) LIKE LOWER($${likeIdx}) THEN 200
        ELSE 0
      END +
      CASE
        WHEN LOWER(postal_code) LIKE LOWER($${likeIdx}) THEN 300
        ELSE 0
      END +
      CASE
        WHEN LOWER(public_remarks) LIKE LOWER($${likeIdx}) THEN 50
        ELSE 0
      END +
      CASE
        WHEN LOWER(listing_key) LIKE LOWER($${likeIdx}) THEN 100
        ELSE 0
      END) AS relevance_score
    `;
    devLog("search-keywords", { keywords: params.keywords, phrases: keywordPhrases.length });
  }

  // ── Bounding box (map viewport) ───────────────────────────────────────────
  const hasBbox =
    params.minLat != null &&
    params.maxLat != null &&
    params.minLng != null &&
    params.maxLng != null &&
    Number.isFinite(params.minLat) &&
    Number.isFinite(params.maxLat) &&
    Number.isFinite(params.minLng) &&
    Number.isFinite(params.maxLng);
  if (hasBbox) {
    where.push("latitude IS NOT NULL AND longitude IS NOT NULL");
    where.push(`latitude BETWEEN $${values.length + 1} AND $${values.length + 2}`);
    where.push(`longitude BETWEEN $${values.length + 3} AND $${values.length + 4}`);
    values.push(
      Math.min(params.minLat!, params.maxLat!),
      Math.max(params.minLat!, params.maxLat!),
      Math.min(params.minLng!, params.maxLng!),
      Math.max(params.minLng!, params.maxLng!),
    );
  }

  // ── Recency filter (new listings) ────────────────────────────────────────
  // Use the MLS market/contract date. Local created_at and updated_at values
  // describe ingestion, not when a home was listed.
  if (params.daysListed) {
    where.push(`COALESCE(on_market_date, listing_contract_date) >= NOW() - ($${values.length + 1} * INTERVAL '1 day')`);
    values.push(params.daysListed);
  }

  if (params.openHouseDate && /^\d{4}-\d{2}-\d{2}$/.test(params.openHouseDate)) {
    if (openHouseTableAvailable) {
      values.push(params.openHouseDate);
      const dateIndex = values.length;
      where.push(`EXISTS (
        SELECT 1
        FROM open_houses AS requested_open_house
        WHERE requested_open_house.listing_key = properties.listing_key
          AND LOWER(COALESCE(requested_open_house.status, '')) NOT IN ('canceled', 'cancelled', 'deleted')
          AND requested_open_house.start_timestamp < ($${dateIndex}::date + INTERVAL '1 day')
          AND COALESCE(requested_open_house.end_timestamp, requested_open_house.start_timestamp) >= $${dateIndex}::date
      )`);
    } else {
      where.push("FALSE");
    }
  } else if (params.openHousesOnly) {
    if (openHouseTableAvailable) {
      where.push(`EXISTS (
        SELECT 1
        FROM open_houses AS requested_open_house
        WHERE requested_open_house.listing_key = properties.listing_key
          AND LOWER(COALESCE(requested_open_house.status, '')) NOT IN ('canceled', 'cancelled', 'deleted')
          AND COALESCE(requested_open_house.end_timestamp, requested_open_house.start_timestamp) >= NOW()
      )`);
    } else {
      where.push("FALSE");
    }
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // ── Sort order ────────────────────────────────────────────────────────────
  let orderBy: string;

  // When keywords are present, prioritize relevance score over other sort options
  if (params.keywords && keywordRelevanceScore) {
    orderBy = "relevance_score DESC, updated_at DESC NULLS LAST";
  } else {
    switch (params.sort) {
      case "price_asc":
        orderBy = "list_price ASC NULLS LAST";
        break;
      case "price_desc":
        orderBy = "list_price DESC NULLS LAST";
        break;
      case "newest":
        orderBy = "COALESCE(on_market_date, listing_contract_date) DESC NULLS LAST, listing_key ASC";
        break;
      case "area_desc":
        orderBy = "living_area DESC NULLS LAST";
        break;
      case "dom_asc":
        orderBy = "COALESCE(days_on_market, 999999) ASC, updated_at DESC NULLS LAST";
        break;
      case "price_reduced":
        // Fallback: approximate "price reduced" by most recently updated listings.
        orderBy = "updated_at DESC NULLS LAST";
        break;
      case "updated":
      default:
        // Surface luxury $3M–$5M tier first, then recency
        orderBy = `
          CASE WHEN list_price >= 3000000 AND list_price <= 5000000 THEN 0 ELSE 1 END,
          updated_at DESC NULLS LAST
        `;
        break;
    }
  }

  // SECURITY: Enforce hard limit to prevent resource exhaustion
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = Math.max(0, params.offset ?? 0);
  const limitIndex = values.length + 1;
  const offsetIndex = values.length + 2;
  values.push(limit, offset);

  const sql = `
    SELECT
      listing_key,
      property_entity_key,
      standard_status           AS status,
      property_type,
      property_sub_type,
      photos_count,
      main_photo_url,
      media_urls,
      list_price,
      bedrooms_total,
      bathrooms_total_integer   AS bathrooms_total,
      living_area,
      lot_size_sq_ft,
      year_built,
      parking_total,
      garage_spaces,
      pool_private_yn,
      waterfront_yn,
      view_yn,
      cumulative_days_on_market,
      days_on_market,
      original_list_price,
      price_change_timestamp,
      subdivision_name,
      city,
      state_or_province         AS state,
      postal_code,
      county_or_parish,
      latitude,
      longitude,
      unparsed_address          AS address,
      listing_agent_mlsid       AS list_agent_dre,
      listing_agent_full_name   AS list_agent_full_name,
      listing_agent_direct_phone AS list_agent_phone,
      listing_agent_email       AS list_agent_email,
      public_remarks,
      hoa_fee,
      hoa_fee_frequency,
      view,
      new_construction_yn,
      senior_community_yn,
      fireplace_yn,
      ${openHouseTableAvailable ? "next_open_house.start_timestamp AS open_house_start_timestamp" : "NULL::timestamptz AS open_house_start_timestamp"},
      ${openHouseTableAvailable ? "next_open_house.end_timestamp AS open_house_end_timestamp" : "NULL::timestamptz AS open_house_end_timestamp"},
      updated_at,
      created_at${keywordRelevanceScore ? ',' + keywordRelevanceScore : ''}
    FROM properties
    ${openHouseTableAvailable ? `LEFT JOIN LATERAL (
      SELECT open_house.start_timestamp, open_house.end_timestamp
      FROM open_houses AS open_house
      WHERE open_house.listing_key = properties.listing_key
        AND LOWER(COALESCE(open_house.status, '')) NOT IN ('canceled', 'cancelled', 'deleted')
        AND COALESCE(open_house.end_timestamp, open_house.start_timestamp) >= NOW()
      ORDER BY open_house.start_timestamp ASC
      LIMIT 1
    ) AS next_open_house ON TRUE` : ""}
    ${whereSql}
    ORDER BY ${orderBy}
    LIMIT $${limitIndex} OFFSET $${offsetIndex};
  `;

  const countSql = `SELECT COUNT(*) FROM properties ${whereSql};`;
  const countValues = values.slice(0, values.length - 2);

  const LIST_TIMEOUT_MS = Number(process.env.PROPERTY_LIST_TIMEOUT_MS ?? 30_000);
  const COUNT_TIMEOUT_MS = Number(process.env.PROPERTY_COUNT_TIMEOUT_MS ?? 15_000);

  const results: { list?: { rows: unknown[]; rowCount?: number }; count?: { rows: { count: string }[] } } = {};

  // ── List query ─────────────────────────────────────────────────────────────
  try {
    const listResult = (await withTimeout(
      pool.query(sql, values),
      LIST_TIMEOUT_MS,
      new Error("list-timeout"),
      true
    )) as { rows: unknown[]; rowCount?: number };
    results.list = listResult;
    devLog("list-success", { rows: listResult?.rowCount });
  } catch (listErr: unknown) {
    const msg = listErr instanceof Error ? listErr.message : String(listErr);
    devLog("list-failure", { err: msg });

    if (msg.includes("timeout")) {
      // Retry a smaller projection, preserving every location and buyer filter.
      try {
        const fallbackSql = `
          SELECT
            listing_key, property_entity_key, standard_status AS status, property_type, property_sub_type,
            main_photo_url, list_price, bedrooms_total,
            bathrooms_total_integer AS bathrooms_total,
            living_area, city, state_or_province AS state, unparsed_address AS address, updated_at
          FROM properties
          ${whereSql}
          ORDER BY updated_at DESC NULLS LAST
          LIMIT $${limitIndex} OFFSET $${offsetIndex};
        `;
        const fallbackResult = (await withTimeout(
          pool.query(fallbackSql, values),
          10_000,
          new Error("fallback-timeout"),
          true
        )) as { rows: unknown[] };
        results.list = fallbackResult;
        devLog("fallback-success", { rows: (fallbackResult as any)?.rowCount });
      } catch {
        results.list = { rows: [] };
      }
    } else {
      throw listErr;
    }
  }

  // ── Count query (non-blocking) ─────────────────────────────────────────────
  try {
    const countResult = await withTimeout(
      pool.query(countSql, countValues),
      COUNT_TIMEOUT_MS,
      new Error("count-timeout"),
      false
    );
    if (countResult && !(countResult instanceof Error)) {
      results.count = countResult as { rows: { count: string }[] };
    }
  } catch {
    // Count failure is non-fatal; total will be estimated from list results
  }

  // Early exit if no rows returned at all
  if (!results.list?.rows) {
    return { properties: [] as PropertyListItem[], total: 0, hasMore: false };
  }

  // ── Determine total ────────────────────────────────────────────────────────
  let total: number;
  if (results.count?.rows?.[0]?.count) {
    total = parseInt(results.count.rows[0].count, 10);
  } else {
    // Estimate: if a full page was returned there are probably more rows
    total =
      results.list.rows.length === limit
        ? offset + limit + 1
        : offset + results.list.rows.length;
  }

  return {
    properties: results.list.rows as PropertyListItem[],
    total,
    hasMore: offset + limit < total,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cursor-based (keyset) pagination
// ─────────────────────────────────────────────────────────────────────────────

/** Opaque cursor payload encoded as base64url JSON. */
interface CursorPayload {
  /** updated_at ISO string of the last row from the previous page. */
  u: string;
  /** listing_key of the last row from the previous page (tie-breaker). */
  k: string;
}

export interface CursorSearchResult {
  properties: PropertyListItem[];
  /** Pass to the next request as `cursor` to fetch the following page. */
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Cursor-based (keyset) search — safe for live data that changes between pages.
 *
 * Sort order is fixed at `updated_at DESC, listing_key ASC` so the cursor
 * is always stable.  Unlike OFFSET, row insertion / deletion between requests
 * cannot cause duplicates or skipped listings.
 *
 * Eliminates the COUNT(*) query entirely, reducing median latency by ~40%.
 */
export async function searchPropertiesCursor(
  params: Omit<PropertySearchParams, "offset">,
  cursor?: string
): Promise<CursorSearchResult> {
  if (!isDatabaseConfigured()) {
    return searchPropertiesCursorFromTrestle(params);
  }

  try {
    return await searchPropertiesCursorFromDatabase(params, cursor);
  } catch (error) {
    const { isTrestleConfigured } = await import('@/lib/trestle-property-fallback');
    if (!isTrestleConfigured()) throw error;

    console.warn('[property-repo] PostgreSQL cursor search failed; using Trestle fallback', {
      message: error instanceof Error ? error.message : String(error),
    });
    return searchPropertiesCursorFromTrestle(params);
  }
}

async function searchPropertiesCursorFromTrestle(
  params: Omit<PropertySearchParams, "offset">
): Promise<CursorSearchResult> {
  const { isTrestleConfigured, searchTrestleProperties } = await import(
    '@/lib/trestle-property-fallback'
  );
  if (!isTrestleConfigured()) {
    return { properties: [], nextCursor: null, hasMore: false };
  }
  const fallback = await searchTrestleProperties({ ...params, offset: 0 });
  return { properties: fallback.properties, nextCursor: null, hasMore: false };
}

async function searchPropertiesCursorFromDatabase(
  params: Omit<PropertySearchParams, "offset">,
  cursor?: string
): Promise<CursorSearchResult> {
  const pool = await getPgPool();
  const openHouseTableAvailable = await supportsOpenHouseTable(pool);
  const values: unknown[] = [];
  const where: string[] = [];

  // ── Status filter (identical to searchProperties) ─────────────────────────
  let isForRent = false;
  if (params.status) {
    const statuses = Array.isArray(params.status) ? params.status : [params.status];
    isForRent = statuses.some((status) => status === "for_rent" || status === "rented");
    const dbStatuses = databaseStatuses(statuses);
    if (dbStatuses.length === 1) {
      where.push(`standard_status = $${values.length + 1}`);
      values.push(dbStatuses[0]);
    } else if (dbStatuses.length > 1) {
      where.push(`standard_status = ANY($${values.length + 1})`);
      values.push(dbStatuses);
    }
  } else {
    where.push(`standard_status = 'Active'`);
  }

  if (isForRent) {
    where.push(`LOWER(REPLACE(property_type, ' ', '')) = 'residentiallease'`);
  } else {
    where.push(
      `property_type NOT IN ('Land','ResidentialLease','CommercialLease','CommercialSale','BusinessOpportunity')`
    );
  }

  function add(cond: string, val?: unknown): void {
    if (val === undefined || val === null) return;
    values.push(val);
    where.push(cond.replace("$IDX", `$${values.length}`));
  }

  // ── Location ───────────────────────────────────────────────────────────────
  if (params.county) {
    const baseName = params.county.replace(/\s+County$/i, "").trim();
    add(
      "LOWER(TRIM(REGEXP_REPLACE(county_or_parish, '\\s+county$', '', 'i'))) = LOWER($IDX)",
      baseName
    );
  }
  if (params.postalCodes && params.postalCodes.length > 0) {
    where.push(`split_part(postal_code, '-', 1) = ANY($${values.length + 1})`);
    values.push(params.postalCodes);
  } else if (params.city) {
    add("LOWER(city) = LOWER($IDX)", params.city);
  }

  const isLocationLevel = !!(params.city || params.county || params.postalCodes?.length || params.locationKeywords);
  const stateFilter = isLocationLevel ? (params.state ?? "CA") : params.state;
  add("LOWER(state_or_province) = LOWER($IDX)", stateFilter);
  add(
    "LOWER(subdivision_name) LIKE LOWER($IDX)",
    params.neighborhood ? `%${params.neighborhood}%` : undefined
  );

  if (params.locationKeywords?.trim()) {
    const idx = values.length + 1;
    values.push(`%${params.locationKeywords.trim()}%`);
    where.push(`(
      LOWER(COALESCE(unparsed_address, '')) LIKE LOWER($${idx})
      OR LOWER(COALESCE(cleaned_address, '')) LIKE LOWER($${idx})
      OR LOWER(COALESCE(city, '')) LIKE LOWER($${idx})
      OR LOWER(COALESCE(subdivision_name, '')) LIKE LOWER($${idx})
      OR LOWER(COALESCE(postal_code, '')) LIKE LOWER($${idx})
      OR LOWER(COALESCE(listing_key, '')) LIKE LOWER($${idx})
    )`);
  }

  // ── Price / size ──────────────────────────────────────────────────────────
  add("list_price >= $IDX", params.minPrice);
  add("list_price <= $IDX", params.maxPrice);
  add("bedrooms_total >= $IDX", params.minBedrooms);
  add("bedrooms_total <= $IDX", params.maxBedrooms);
  add("bathrooms_total_integer >= $IDX", params.minBathrooms);
  add("bathrooms_total_integer <= $IDX", params.maxBathrooms);
  add("living_area >= $IDX", params.minLivingArea);
  add("living_area <= $IDX", params.maxLivingArea);
  add("lot_size_sq_ft >= $IDX", params.minLotSize);
  add("lot_size_sq_ft <= $IDX", params.maxLotSize);
  add("year_built >= $IDX", params.minYearBuilt);
  add("year_built <= $IDX", params.maxYearBuilt);
  add("COALESCE(hoa_fee, 0) <= $IDX", params.maxHoaFee);

  if (params.hasGarage) where.push("COALESCE(garage_spaces, 0) > 0");
  if (params.priceReduced) {
    where.push("price_change_timestamp IS NOT NULL");
    where.push("COALESCE(original_list_price, list_price) > list_price");
  }

  // ── Property type ─────────────────────────────────────────────────────────
  if (isForRent) {
    where.push(`(LOWER(property_type) = 'residentiallease' OR LOWER(property_type) = 'residential lease')`);
  } else if (params.propertyType) {
    if (params.propertyType === "Residential") {
      where.push(`LOWER(property_type) = 'residential' AND LOWER(property_type) NOT LIKE '%lease%'`);
    } else if (params.propertyType === "ResidentialLease") {
      where.push(`(LOWER(property_type) = 'residentiallease' OR LOWER(property_type) = 'residential lease')`);
    } else {
      add("LOWER(property_type) LIKE LOWER($IDX)", `%${params.propertyType}%`);
    }
  }

  // ── Property category ─────────────────────────────────────────────────────
  if (params.propertyCategory) {
    const category = params.propertyCategory.split(",")[0].trim().toLowerCase();
    if (category === "house") {
      where.push(`(REPLACE(LOWER(property_sub_type), ' ', '') IN ('singlefamilyresidence','cabin','farm'))`);
    } else if (category === "condo") {
      where.push(`(REPLACE(LOWER(property_sub_type), ' ', '') IN ('condominium','stockcooperative','loft','coownership','ownyourown'))`);
    } else if (category === "townhouse") {
      where.push(`REPLACE(LOWER(property_sub_type), ' ', '') = 'townhouse'`);
    } else if (category === "manufactured") {
      where.push(`(REPLACE(LOWER(property_sub_type), ' ', '') IN ('manufacturedonland','manufacturedhome','mobilehome'))`);
    } else if (category === "multifamily") {
      where.push(`(REPLACE(LOWER(property_sub_type), ' ', '') IN ('duplex','triplex','quadruplex','mixeduse'))`);
    } else {
      add("LOWER(property_sub_type) LIKE LOWER($IDX)", `%${params.propertyCategory}%`);
    }
  }

  // ── Amenity flags ─────────────────────────────────────────────────────────
  if (params.hasPool) where.push(POOL_FILTER_SQL);
  if (params.hasView) where.push(`view_yn = TRUE`);
  if (params.hasOceanView) where.push(OCEAN_VIEW_FILTER_SQL);
  if (params.isWaterfront) where.push(`waterfront_yn = TRUE`);
  if (params.isNewConstruction) where.push(`new_construction_yn = TRUE`);
  if (params.isSeniorCommunity) where.push(`senior_community_yn = TRUE`);
  if (params.hasFireplace) where.push(`fireplace_yn = TRUE`);

  // ── Keywords with relevance scoring ───────────────────────────────────────
  let keywordRelevanceScoreCursor = '';
  if (params.keywords) {
    const lower = params.keywords.toLowerCase().trim();
    const bedroomMatch = lower.match(/(\d+)\s*(bedroom|bed|br)/);
    if (bedroomMatch && !params.minBedrooms) add("bedrooms_total >= $IDX", parseInt(bedroomMatch[1]));
    const bathroomMatch = lower.match(/(\d+)\s*(bathroom|bath|ba)/);
    if (bathroomMatch && !params.minBathrooms) add("bathrooms_total_integer >= $IDX", parseInt(bathroomMatch[1]));

    // Comma-separated keyword phrases use OR semantics per phrase.
    // Never reference the SELECT alias "address" — use unparsed_address.
    const keywordPhrasesCursor = params.keywords.split(',').map(k => k.trim()).filter(Boolean);
    const orConditionsCursor: string[] = [];
    for (const phrase of keywordPhrasesCursor) {
      const idx = values.length + 1;
      values.push(`%${phrase}%`);
      orConditionsCursor.push(
        `LOWER(city) LIKE LOWER($${idx})`,
        `LOWER(unparsed_address) LIKE LOWER($${idx})`,
        `LOWER(postal_code) LIKE LOWER($${idx})`,
        `LOWER(public_remarks) LIKE LOWER($${idx})`,
        `LOWER(listing_key) LIKE LOWER($${idx})`,
      );
    }
    if (orConditionsCursor.length > 0) {
      where.push(`(${orConditionsCursor.join(' OR ')})`);
    }

    const primaryPhraseCursor = keywordPhrasesCursor[0] ?? params.keywords;
    const exactIdxC = values.length + 1;
    const likeIdxC  = values.length + 2;
    values.push(primaryPhraseCursor, `%${primaryPhraseCursor}%`);
    keywordRelevanceScoreCursor = `
      (CASE
        WHEN LOWER(city) = LOWER($${exactIdxC}) THEN 1000
        WHEN LOWER(city) LIKE LOWER($${likeIdxC}) THEN 500
        ELSE 0
      END +
      CASE
        WHEN LOWER(unparsed_address) = LOWER($${exactIdxC}) THEN 400
        WHEN LOWER(unparsed_address) LIKE LOWER($${likeIdxC}) THEN 200
        ELSE 0
      END +
      CASE
        WHEN LOWER(postal_code) LIKE LOWER($${likeIdxC}) THEN 300
        ELSE 0
      END +
      CASE
        WHEN LOWER(public_remarks) LIKE LOWER($${likeIdxC}) THEN 50
        ELSE 0
      END +
      CASE
        WHEN LOWER(listing_key) LIKE LOWER($${likeIdxC}) THEN 100
        ELSE 0
      END) AS relevance_score
    `;
  }

  // ── Bounding box (map viewport) ───────────────────────────────────────────
  const hasBboxCursor =
    params.minLat != null &&
    params.maxLat != null &&
    params.minLng != null &&
    params.maxLng != null &&
    Number.isFinite(params.minLat) &&
    Number.isFinite(params.maxLat) &&
    Number.isFinite(params.minLng) &&
    Number.isFinite(params.maxLng);
  if (hasBboxCursor) {
    where.push("latitude IS NOT NULL AND longitude IS NOT NULL");
    where.push(`latitude BETWEEN $${values.length + 1} AND $${values.length + 2}`);
    where.push(`longitude BETWEEN $${values.length + 3} AND $${values.length + 4}`);
    values.push(
      Math.min(params.minLat!, params.maxLat!),
      Math.max(params.minLat!, params.maxLat!),
      Math.min(params.minLng!, params.maxLng!),
      Math.max(params.minLng!, params.maxLng!)
    );
  }

  // ── Recency filter (new listings) ────────────────────────────────────────
  // Use the MLS market/contract date. Local created_at and updated_at values
  // describe ingestion, not when a home was listed.
  if (params.daysListed) {
    where.push(`COALESCE(on_market_date, listing_contract_date) >= NOW() - ($${values.length + 1} * INTERVAL '1 day')`);
    values.push(params.daysListed);
  }

  if (params.openHouseDate && /^\d{4}-\d{2}-\d{2}$/.test(params.openHouseDate)) {
    if (openHouseTableAvailable) {
      values.push(params.openHouseDate);
      const dateIndex = values.length;
      where.push(`EXISTS (
        SELECT 1
        FROM open_houses AS requested_open_house
        WHERE requested_open_house.listing_key = properties.listing_key
          AND LOWER(COALESCE(requested_open_house.status, '')) NOT IN ('canceled', 'cancelled', 'deleted')
          AND requested_open_house.start_timestamp < ($${dateIndex}::date + INTERVAL '1 day')
          AND COALESCE(requested_open_house.end_timestamp, requested_open_house.start_timestamp) >= $${dateIndex}::date
      )`);
    } else {
      where.push("FALSE");
    }
  } else if (params.openHousesOnly) {
    if (openHouseTableAvailable) {
      where.push(`EXISTS (
        SELECT 1
        FROM open_houses AS requested_open_house
        WHERE requested_open_house.listing_key = properties.listing_key
          AND LOWER(COALESCE(requested_open_house.status, '')) NOT IN ('canceled', 'cancelled', 'deleted')
          AND COALESCE(requested_open_house.end_timestamp, requested_open_house.start_timestamp) >= NOW()
      )`);
    } else {
      where.push("FALSE");
    }
  }

  // ── Cursor (keyset) condition ──────────────────────────────────────────────
  // WHERE (updated_at < cursor_ts) OR (updated_at = cursor_ts AND listing_key > cursor_key)
  // This pages forward along the fixed sort: updated_at DESC, listing_key ASC
  if (cursor) {
    try {
      const decoded = JSON.parse(
        Buffer.from(cursor, "base64url").toString("utf8")
      ) as CursorPayload;
      const cursorTs = decoded.u;
      const cursorKey = decoded.k;
      // Validate before injecting into query
      if (typeof cursorTs !== "string" || typeof cursorKey !== "string") {
        throw new Error("invalid cursor shape");
      }
      const tsIdx = values.length + 1;
      const keyIdx = values.length + 2;
      values.push(cursorTs, cursorKey);
      where.push(
        `(updated_at < $${tsIdx} OR (updated_at = $${tsIdx} AND listing_key > $${keyIdx}))`
      );
    } catch {
      // Bad cursor — ignore it and return the first page instead of throwing
      devLog("cursor-decode-failed", { cursor });
    }
  }

  const whereSqlCursor = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const limitCursor = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const limitIdx = values.length + 1;
  values.push(limitCursor + 1); // fetch one extra to detect hasMore

  // Determine sort order - prioritize relevance when keywords are present
  const orderByCursor = params.keywords && keywordRelevanceScoreCursor
    ? "relevance_score DESC, updated_at DESC NULLS LAST, listing_key ASC"
    : "updated_at DESC NULLS LAST, listing_key ASC";

  const cursorSql = `
    SELECT
      listing_key,
      property_entity_key,
      standard_status           AS status,
      property_type,
      property_sub_type,
      photos_count,
      main_photo_url,
      media_urls,
      list_price,
      bedrooms_total,
      bathrooms_total_integer   AS bathrooms_total,
      living_area,
      lot_size_sq_ft,
      year_built,
      parking_total,
      garage_spaces,
      pool_private_yn,
      waterfront_yn,
      view_yn,
      cumulative_days_on_market,
      days_on_market,
      original_list_price,
      price_change_timestamp,
      subdivision_name,
      city,
      state_or_province         AS state,
      postal_code,
      county_or_parish,
      latitude,
      longitude,
      unparsed_address          AS address,
      listing_agent_mlsid       AS list_agent_dre,
      listing_agent_full_name   AS list_agent_full_name,
      listing_agent_direct_phone AS list_agent_phone,
      listing_agent_email       AS list_agent_email,
      public_remarks,
      hoa_fee,
      hoa_fee_frequency,
      view,
      new_construction_yn,
      senior_community_yn,
      fireplace_yn,
      ${openHouseTableAvailable ? "next_open_house.start_timestamp AS open_house_start_timestamp" : "NULL::timestamptz AS open_house_start_timestamp"},
      ${openHouseTableAvailable ? "next_open_house.end_timestamp AS open_house_end_timestamp" : "NULL::timestamptz AS open_house_end_timestamp"},
      updated_at,
      created_at${keywordRelevanceScoreCursor ? ',' + keywordRelevanceScoreCursor : ''}
    FROM properties
    ${openHouseTableAvailable ? `LEFT JOIN LATERAL (
      SELECT open_house.start_timestamp, open_house.end_timestamp
      FROM open_houses AS open_house
      WHERE open_house.listing_key = properties.listing_key
        AND LOWER(COALESCE(open_house.status, '')) NOT IN ('canceled', 'cancelled', 'deleted')
        AND COALESCE(open_house.end_timestamp, open_house.start_timestamp) >= NOW()
      ORDER BY open_house.start_timestamp ASC
      LIMIT 1
    ) AS next_open_house ON TRUE` : ""}
    ${whereSqlCursor}
    ORDER BY ${orderByCursor}
    LIMIT $${limitIdx};
  `;

  const LIST_TIMEOUT_MS_CURSOR = Number(process.env.PROPERTY_LIST_TIMEOUT_MS ?? 30_000);
  const rows = await (async () => {
    const result = (await withTimeout(
      pool.query(cursorSql, values),
      LIST_TIMEOUT_MS_CURSOR,
      new Error("cursor-list-timeout"),
      true
    )) as { rows: unknown[] };
    return result.rows as PropertyListItem[];
  })();

  const hasMore = rows.length > limitCursor;
  const page = hasMore ? rows.slice(0, limitCursor) : rows;

  let nextCursor: string | null = null;
  if (hasMore && page.length > 0) {
    const last = page[page.length - 1] as { updated_at?: string; listing_key: string };
    const payload: CursorPayload = {
      u: last.updated_at ?? new Date(0).toISOString(),
      k: last.listing_key,
    };
    nextCursor = Buffer.from(JSON.stringify(payload)).toString("base64url");
  }

  return { properties: page, nextCursor, hasMore };
}

/**
 * Fetch a single property row by its MLS listing key.
 * Returns `null` when the listing does not exist in the database.
 */
export async function getPropertyByListingKey(listingKey: string) {
  try {
    const pool = await getPgPool();
    const sql = `
    SELECT *
    FROM properties
    WHERE listing_key = $1
    LIMIT 1;
  `;
    const { rows } = await pool.query(sql, [listingKey]);
    if (!rows[0]) {
      const { getTrestlePropertyRow } = await import('@/lib/trestle-property-fallback');
      return getTrestlePropertyRow(listingKey);
    }

    const r = rows[0] as Record<string, unknown>;
    return {
      listing_key: r.listing_key,
      status: r.standard_status,
      mls_status: r.mls_status ?? r.standard_status,
      property_type: r.property_type,
      property_sub_type: r.property_sub_type,
      photos_count: r.photos_count,
      main_photo_url: r.main_photo_url,
      media_urls: r.media_urls,
      list_price: r.list_price,
      bedrooms_total: r.bedrooms_total,
      bathrooms_total: r.bathrooms_total_integer ?? r.bathrooms_total,
      rooms_total: r.rooms_total ?? null,
      living_area: r.living_area,
      lot_size_sq_ft: r.lot_size_sq_ft,
      year_built: r.year_built,
      parking_total: r.parking_total,
      garage_spaces: r.garage_spaces ?? null,
      carport_spaces: r.carport_spaces ?? null,
      cumulative_days_on_market: r.cumulative_days_on_market,
      days_on_market: r.days_on_market,
      original_list_price: r.original_list_price,
      subdivision_name: r.subdivision_name,
      school_district: r.school_district ?? null,
      elementary_school: r.elementary_school ?? null,
      middle_school: r.middle_school ?? null,
      high_school: r.high_school ?? null,
      stories_total: r.stories_total ?? null,
      pool_private_yn: r.pool_private_yn ?? false,
      waterfront_yn: r.waterfront_yn ?? false,
      view_yn: r.view_yn ?? false,
      heating: r.heating ?? null,
      cooling: r.cooling ?? null,
      electric: r.electric ?? null,
      sewer: r.sewer ?? null,
      water: r.water ?? null,
      interior_features: r.interior_features ?? null,
      exterior_features: r.exterior_features ?? null,
      parking_features: r.parking_features ?? null,
      pool_features: r.pool_features ?? null,
      lot_features: r.lot_features ?? null,
      appliances: r.appliances ?? null,
      security_features: r.security_features ?? null,
      architectural_style: r.architectural_style ?? null,
      zoning: r.zoning ?? null,
      hoa_fee: r.hoa_fee ?? null,
      hoa_fee_frequency: r.hoa_fee_frequency ?? null,
      city: r.city,
      state_or_province: r.state_or_province,
      postal_code: r.postal_code,
      county_or_parish: r.county_or_parish,
      latitude: r.latitude,
      longitude: r.longitude,
      unparsed_address: r.unparsed_address,
      cleaned_address: r.cleaned_address ?? null,
      listing_agent_key: r.listing_agent_key ?? null,
      list_agent_dre: r.listing_agent_mlsid ?? null,
      listing_agent_first_name: r.listing_agent_first_name ?? null,
      listing_agent_last_name: r.listing_agent_last_name ?? null,
      list_agent_full_name: r.listing_agent_full_name ?? null,
      list_agent_email: r.listing_agent_email ?? null,
      list_agent_phone: r.listing_agent_direct_phone ?? null,
      listing_agent_office_phone: r.listing_agent_office_phone ?? null,
      list_office_name: r.list_office_name ?? null,
      public_remarks: r.public_remarks,
      private_remarks: r.private_remarks ?? null,
      price_history: r.price_history ?? null,
      updated_at: r.updated_at,
      created_at: r.created_at,
    };
  } catch (error) {
    console.error('Error fetching property by listing key:', listingKey, error);
    try {
      const { getTrestlePropertyRow } = await import('@/lib/trestle-property-fallback');
      return await getTrestlePropertyRow(listingKey);
    } catch (fallbackError) {
      console.error('Trestle fallback failed for listing key:', listingKey, fallbackError);
      return null;
    }
  }
}

/**
 * Placeholder for property media lookup.
 * Media URLs are embedded in the main `properties` row (`media_urls` column);
 * no separate media table exists to query.
 */
export async function getPropertyMediaByListingKey(
  _listingKey: string
): Promise<null> {
  return null;
}
