// Real Postgres-backed landing query layer.
// Provides aggregate stats + featured listings + basic SEO scaffolding.
// NOTE: AI generation has been REMOVED from this layer.
// AI content is fetched from cache only - generation via admin API.

import { LandingKind, LandingData, LandingStats, LandingPropertyCard } from '@/types/landing'
import { searchProperties } from '@/lib/db/property-repo'
import { getPgPool, isDatabaseConfigured } from '@/lib/db'
import type { LandingDef } from './defs'
import { isBuildPhase } from '@/lib/env/buildDetection'
import { COUNTIES } from '@/lib/counties'
import { buildPropertyMediaUrls } from '@/lib/property-normalization'

function landingDebug(...args: unknown[]) {
  if (process.env.LANDING_DEBUG === '1' || process.env.LANDING_TRACE === '1') {
    console.log(...args)
  }
}

// ─── Static internal-linking: city → sibling cities in same county ──────────
//
// Built once at module initialisation (zero DB overhead at request time).
// Maps a lower-cased city name to an array of sibling city links within the
// same county.  Used to populate `relatedCities` on every landing page.
//
// Example: 'carlsbad' → [
//   { city: 'Chula Vista', state: 'CA', href: '/california/chula-vista/homes-for-sale' },
//   ...
// ]
const CITY_COUNTY_SIBLINGS = new Map<string, Array<{ city: string; state: string; href: string }>>()
;(function buildSiblingMap() {
  for (const county of COUNTIES) {
    if (county.cities.length < 2) continue // nothing to link to with only one city
    const siblings = county.cities.map((c) => ({
      city: c.name,
      state: 'CA',
      // Strip the trailing '-ca' suffix — landing URLs use bare slugs
      href: `/buy/${county.slug}/${c.slug}`,
    }))
    for (const city of county.cities) {
      // Each city points to every OTHER city in the same county
      CITY_COUNTY_SIBLINGS.set(
        city.name.toLowerCase(),
        siblings.filter((s) => s.city !== city.name)
      )
    }
  }
})()

const CONDO_SUBTYPE_SQL = `REPLACE(LOWER(COALESCE(property_sub_type, '')), ' ', '') IN (
  'condominium','stockcooperative','loft','coownership','ownyourown'
)`
const HOUSE_SUBTYPE_SQL = `REPLACE(LOWER(COALESCE(property_sub_type, '')), ' ', '') IN (
  'singlefamilyresidence','cabin','farm'
)`
const POOL_SQL = `(
  pool_private_yn = TRUE
  OR LOWER(TRIM(COALESCE(pool_features, ''))) NOT IN ('', 'none', 'no', 'false', '0')
)`
const OCEAN_VIEW_SQL = `(
  LOWER(COALESCE(view, '')) ~ '(ocean|coast|water|bay|harbor|sea)'
  OR LOWER(COALESCE(public_remarks, '')) ~ '(ocean view|coastal view|water view|bay view|harbor view|sea view)'
)`

// Map landing kind to the same structured predicates used by the listing search.
export function buildKindFilter(kind: LandingKind): { sql: string; params: any[]; searchParams: Record<string, any> } {
  switch (kind) {
    case 'homes-with-pool':
      return { sql: `AND ${POOL_SQL}`, params: [], searchParams: { hasPool: true } }
    case 'homes-under-500k':
      return { sql: 'AND list_price <= $EXTRA1', params: [500000], searchParams: { maxPrice: 500000 } }
    case 'homes-over-1m':
      return { sql: 'AND list_price >= $EXTRA1', params: [1000000], searchParams: { minPrice: 1000000 } }
    case 'luxury-homes':
      return { sql: 'AND list_price >= $EXTRA1', params: [1000000], searchParams: { minPrice: 1000000 } }
    case 'condos-for-sale':
      return { sql: `AND ${CONDO_SUBTYPE_SQL}`, params: [], searchParams: { propertyCategory: 'condo' } }
    case '2-bedroom-apartments':
      // Treat as 2-bedroom units (apartments, condos, etc.)
      return {
        sql: `AND bedrooms_total = 2 AND ${CONDO_SUBTYPE_SQL}`,
        params: [],
        searchParams: { minBedrooms: 2, maxBedrooms: 2, propertyCategory: 'condo' },
      }
    case '3-bedroom-homes':
      return { sql: "AND bedrooms_total >= 3", params: [], searchParams: { minBedrooms: 3 } }
    case '4-bedroom-homes':
      return { sql: "AND bedrooms_total >= 4", params: [], searchParams: { minBedrooms: 4 } }
    case 'single-family-homes':
      return {
        sql: `AND ${HOUSE_SUBTYPE_SQL}`,
        params: [],
        searchParams: { propertyCategory: 'house' },
      }
    case 'new-construction':
      return {
        sql: "AND new_construction_yn = TRUE",
        params: [],
        searchParams: { isNewConstruction: true },
      }
    case 'townhomes-for-sale':
      return {
        sql: "AND REPLACE(LOWER(COALESCE(property_sub_type, '')), ' ', '') = 'townhouse'",
        params: [],
        searchParams: { propertyCategory: 'townhouse' },
      }
    case 'ocean-view-homes':
      return { sql: `AND ${OCEAN_VIEW_SQL}`, params: [], searchParams: { hasOceanView: true } }
    case 'gated-community':
      return {
        sql: "AND LOWER(COALESCE(public_remarks, '')) LIKE '%gated%'",
        params: [],
        searchParams: { keywords: 'gated community,gated' },
      }
    case 'homes-with-garage':
      return {
        sql: 'AND COALESCE(garage_spaces, 0) > 0',
        params: [],
        searchParams: { hasGarage: true },
      }
    case 'homes-for-sale':
    default:
      return { sql: '', params: [], searchParams: {} }
  }
}

// State mapping (US) abbreviation -> full name
const STATE_MAP: Record<string, string> = {
  AL: 'alabama', AK: 'alaska', AZ: 'arizona', AR: 'arkansas', CA: 'california', CO: 'colorado', CT: 'connecticut',
  DE: 'delaware', FL: 'florida', GA: 'georgia', HI: 'hawaii', ID: 'idaho', IL: 'illinois', IN: 'indiana', IA: 'iowa',
  KS: 'kansas', KY: 'kentucky', LA: 'louisiana', ME: 'maine', MD: 'maryland', MA: 'massachusetts', MI: 'michigan',
  MN: 'minnesota', MS: 'mississippi', MO: 'missouri', MT: 'montana', NE: 'nebraska', NV: 'nevada', NH: 'new hampshire',
  NJ: 'new jersey', NM: 'new mexico', NY: 'new york', NC: 'north carolina', ND: 'north dakota', OH: 'ohio', OK: 'oklahoma',
  OR: 'oregon', PA: 'pennsylvania', RI: 'rhode island', SC: 'south carolina', SD: 'south dakota', TN: 'tennessee', TX: 'texas',
  UT: 'utah', VT: 'vermont', VA: 'virginia', WA: 'washington', WV: 'west virginia', WI: 'wisconsin', WY: 'wyoming'
}
const FULL_TO_ABBR: Record<string,string> = Object.fromEntries(Object.entries(STATE_MAP).map(([abbr, full]) => [full, abbr]))

function detectStateToken(tokenRaw: string): { isState: boolean; abbr?: string; canonical?: string } {
  const token = tokenRaw.trim().toLowerCase()
  if (token.length === 2 && STATE_MAP[token.toUpperCase()]) {
    return { isState: true, abbr: token.toUpperCase(), canonical: STATE_MAP[token.toUpperCase()] }
  }
  if (FULL_TO_ABBR[token]) {
    return { isState: true, abbr: FULL_TO_ABBR[token], canonical: token }
  }
  return { isState: false }
}

// Cache whether days_on_market column exists to build safe aggregate query
let hasDaysOnMarketColumn: boolean | null = null
async function ensureSchemaIntrospection() {
  if (hasDaysOnMarketColumn !== null) return
  try {
    const pool = await getPgPool()
    const { rows } = await pool.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'days_on_market' LIMIT 1`
    )
    hasDaysOnMarketColumn = !!rows.length
  } catch {
    console.warn('Landing schema introspection failed; using the date-based fallback for this request')
  }
}

export async function getLandingStats(cityOrState: string, kind: LandingKind): Promise<LandingStats> {
  landingDebug('🔍 [getLandingStats] START', { cityOrState, kind })

  if (isBuildPhase() || !isDatabaseConfigured()) {
    landingDebug('[getLandingStats] Skipping DB stats because data access is unavailable', { cityOrState, kind })
    return {}
  }

  await ensureSchemaIntrospection()

  try {
    const pool = await getPgPool()
    const stateInfo = detectStateToken(cityOrState)
    const baseParams: any[] = []
    const kindFilter = buildKindFilter(kind)
    const selectDays = hasDaysOnMarketColumn
      ? 'ROUND(AVG(days_on_market)) AS days_on_market'
      : "ROUND(AVG(GREATEST(1, EXTRACT(DAY FROM (NOW() - COALESCE(on_market_date, modification_timestamp, created_at, NOW())))))) AS days_on_market" // fallback heuristic using available date columns
    // Base filter built dynamically depending on whether token is state.
    let locationPredicate = ''
    if (stateInfo.isState) {
      // Normalize full name path to abbreviation (DB likely stores abbreviation)
      baseParams.push(stateInfo.abbr)
      locationPredicate = 'AND LOWER(state_or_province) = LOWER($1)'
    } else {
      baseParams.push(cityOrState, 'CA')
      locationPredicate = 'AND LOWER(city) = LOWER($1) AND LOWER(state_or_province) = LOWER($2)'
    }

    let sql = `SELECT
      ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY list_price)::numeric) AS median_price,
      ROUND(AVG(list_price / NULLIF(living_area,0))) AS price_per_sqft,
      ${selectDays},
      COUNT(*) AS total_active,
      MAX(modification_timestamp) AS last_updated
    FROM properties
    WHERE standard_status = 'Active'
      AND property_type NOT IN ('Land','ResidentialLease','CommercialLease','CommercialSale','BusinessOpportunity')
      ${locationPredicate}`

    // Inject kind-specific predicate & params (only once)
    if (kindFilter.sql) {
      if (kindFilter.params.length) {
        kindFilter.params.forEach((p, idx) => {
          baseParams.push(p)
          const paramIndex = baseParams.length
          sql += '\n      ' + kindFilter.sql.replace('$EXTRA' + (idx + 1), '$' + paramIndex)
        })
      } else {
        sql += '\n      ' + kindFilter.sql
      }
    }

    landingDebug('📊 [getLandingStats] SQL Query:', sql)
    landingDebug('📊 [getLandingStats] Parameters:', baseParams)
    if (process.env.LANDING_DEBUG) {
      landingDebug('[landing.stats.sql]', sql, baseParams)
    }

    const { rows } = await pool.query(sql, baseParams)
    landingDebug('📊 [getLandingStats] Query Results:', { rowCount: rows.length, firstRow: rows[0] })
    const r = rows[0]
    if (!r) {
      landingDebug('❌ [getLandingStats] No results returned')
      return {}
    }
    const stats = {
      medianPrice: r.median_price != null ? Number(r.median_price) : undefined,
      pricePerSqft: r.price_per_sqft != null ? Number(r.price_per_sqft) : undefined,
      daysOnMarket: r.days_on_market != null ? Number(r.days_on_market) : undefined,
      totalActive: r.total_active != null ? Number(r.total_active) : undefined,
      lastUpdated: r.last_updated ? String(r.last_updated) : undefined
    }
    landingDebug('✅ [getLandingStats] SUCCESS', stats)
    return stats
  } catch (e) {
    console.error('❌ [getLandingStats] ERROR:', e)
    console.error('Error fetching landing stats for', cityOrState, kind, ':', e)
    return {}
  }
}

export async function getFeaturedProperties(cityOrState: string, kind: LandingKind, limit = 12, extraFilters?: Record<string, any>): Promise<LandingPropertyCard[]> {
  landingDebug('🏠 [getFeaturedProperties] START', { cityOrState, kind, limit, extraFilters })
  const kindFilter = buildKindFilter(kind)
  landingDebug('🏠 [getFeaturedProperties] Kind filter:', kindFilter)
  const stateInfo = detectStateToken(cityOrState)
  landingDebug('🏠 [getFeaturedProperties] State info:', stateInfo)

  // Skip during build phase only - at runtime (even on Vercel), fetch from DB
  if (isBuildPhase()) {
    landingDebug('⚠️  [getFeaturedProperties] SKIPPED - build phase detected', { cityOrState, kind })
    if (process.env.LANDING_TRACE) landingDebug('[landing.featured] skipping properties fetch due to build phase', { cityOrState, kind })
    return []
  }

  try {
    const baseParams: any = {
      limit,
      sort: 'updated',
      ...kindFilter.searchParams
    }
  // Merge any additional filters (e.g., from LandingDef presets already mapped to searchProperties schema)
  if (extraFilters) {
    // CHANGE: Remove propertyType if it's 'apartment' - too restrictive
    const { propertyType, ...otherFilters } = extraFilters

    // Only apply propertyType if it's a specific type like 'condo'
    if (propertyType && propertyType !== 'apartment') {
      Object.assign(baseParams, { propertyType })
    }
    Object.assign(baseParams, otherFilters)
  }

    // Apply price filtering only when the page intent explicitly requires it.
    if (kind === 'homes-under-500k' || kind.includes('under-500k') || kind.includes('below-500k')) {
      landingDebug('[getFeaturedProperties] Applying under-500k price filter')
      delete baseParams.minPrice
      baseParams.maxPrice = 500000
    }

    if (stateInfo.isState) {
      baseParams.state = stateInfo.abbr
    } else {
      baseParams.city = cityOrState
    }
    landingDebug('🏠 [getFeaturedProperties] Search params:', baseParams)
    landingDebug('🏠 [getFeaturedProperties] Calling searchProperties...')
    const { properties } = await searchProperties(baseParams)
    landingDebug('🏠 [getFeaturedProperties] searchProperties returned:', properties.length, 'properties')
    if (properties.length > 0) {
      landingDebug('🏠 [getFeaturedProperties] First property sample:', properties[0])
    }
    if (process.env.LANDING_DEBUG) {
      landingDebug(`[landing.featured] token=${cityOrState} kind=${kind} count=${properties.length}`)
    }
    const mapped = properties.map((p: any) => {
      const images = buildPropertyMediaUrls({
        listingKey: p.listing_key,
        mainPhotoUrl: p.main_photo_url,
        mediaUrls: p.media_urls,
        photosCount: p.photos_count,
      }, 5)

      return {
        listingKey: p.listing_key,
        entityKey: p.property_entity_key ?? undefined,
        address: p.address ?? undefined,
        city: p.city,
        state: p.state,
        postalCode: p.postal_code ?? undefined,
        propertyType: p.property_type ?? undefined,
        propertySubType: p.property_sub_type ?? undefined,
        price: p.list_price ?? undefined,
        beds: p.bedrooms_total ?? undefined,
        baths: p.bathrooms_total ?? undefined,
        sqft: p.living_area ?? undefined,
        lotSizeSqft: p.lot_size_sq_ft ?? undefined,
        yearBuilt: p.year_built ?? undefined,
        hoaFee: p.hoa_fee ?? undefined,
        hoaFeeFrequency: p.hoa_fee_frequency ?? undefined,
        daysOnMarket: p.days_on_market ?? undefined,
        photosCount: p.photos_count ?? images.length,
        status: p.status ?? undefined,
        img: images[0] ?? undefined,
        lat: p.latitude ?? undefined,
        lng: p.longitude ?? undefined,
      }
    })
    landingDebug('✅ [getFeaturedProperties] SUCCESS - returning', mapped.length, 'mapped properties')
    return mapped
  } catch (e) {
    console.error('❌ [getFeaturedProperties] ERROR:', e)
    console.error('Error fetching featured properties', e)
    return []
  }
}

// High-level orchestrator for landing page data
export async function getLandingData(cityOrState: string, kind: LandingKind, opts?: { landingDef?: LandingDef }): Promise<LandingData> {
  landingDebug('🎯 [getLandingData] START', { cityOrState, kind, hasLandingDef: !!opts?.landingDef })
  const landingDef = opts?.landingDef
  // Derive additional filters from config (must be mapped to searchProperties accepted params)
  let extraFilters: Record<string, any> | undefined
  if (landingDef) {
    try {
      const preset = landingDef.filters(cityOrState)
      // Map generic filters to backend param names (basic mapping kept inline for now)
      const mapped: Record<string, any> = {}
      if (preset.city) mapped.city = preset.city
      // Note: status filter removed - searchProperties doesn't support it and filters by Active by default
      if ((preset as any).propertyType) {
        const pt = (preset as any).propertyType
        const normalizedType = String(Array.isArray(pt) ? pt[0] : pt).toLowerCase()
        if (normalizedType.includes('condo') || normalizedType === 'apartment') mapped.propertyCategory = 'condo'
        else if (normalizedType.includes('single family')) mapped.propertyCategory = 'house'
        else if (normalizedType.includes('townh')) mapped.propertyCategory = 'townhouse'
        else if (normalizedType.includes('manufactured') || normalizedType.includes('mobile')) mapped.propertyCategory = 'manufactured'
        else mapped.propertyType = Array.isArray(pt) ? pt[0] : pt
      }
      if ((preset as any).hasPool) mapped.hasPool = true
      if ((preset as any).hasView) mapped.hasView = true
      if ((preset as any).isWaterfront) mapped.isWaterfront = true
      if ((preset as any).hasGarage) mapped.hasGarage = true
      if (Array.isArray((preset as any).features)) {
        const features = (preset as any).features.map((feature: unknown) => String(feature).toLowerCase())
        if (features.includes('garage')) mapped.hasGarage = true
        if (features.includes('ocean view')) mapped.hasOceanView = true
        else if (features.includes('view')) mapped.hasView = true
        if (features.includes('waterfront')) mapped.isWaterfront = true
        if (features.includes('new construction')) mapped.isNewConstruction = true
        if (features.includes('gated')) mapped.keywords = 'gated community,gated'
      }
      if ((preset as any).priceRange) {
        const [min, max] = (preset as any).priceRange
        if (min != null) mapped.minPrice = min
        if (max != null && max !== Number.MAX_SAFE_INTEGER) mapped.maxPrice = max
      }
      if ((preset as any).beds) {
        const bedsVal = (preset as any).beds
        if (typeof bedsVal === 'string' && bedsVal.endsWith('+')) mapped.minBedrooms = Number(bedsVal.replace(/\+/,'') || '0')
        else mapped.minBedrooms = Number(bedsVal)
      }
      extraFilters = mapped
    } catch (e) {
      console.warn('[landingData] preset filter mapping failed', e)
    }
  }

  landingDebug('🎯 [getLandingData] Extra filters:', extraFilters)
  landingDebug('🎯 [getLandingData] Starting parallel data fetch (stats, featured)...')

  const [stats, featured] = await Promise.all([
    getLandingStats(cityOrState, kind),
    getFeaturedProperties(cityOrState, kind, 12, extraFilters)
  ])

  landingDebug('🎯 [getLandingData] Parallel fetch complete:', {
    statsKeys: Object.keys(stats || {}),
    featuredCount: featured?.length || 0,
    note: 'Landing content is generated from live property data and local defaults'
  })

  // Basic placeholder / TODO sections (external data integrations later)
  const neighborhoods: NonNullable<LandingData['neighborhoods']> = [] // TODO integrate neighborhoods API
  const schools: NonNullable<LandingData['schools']> = [] // TODO integrate schools API
  const trends: NonNullable<LandingData['trends']> = [] // TODO market trends source
  // FAQ switching by landing intent. Answers avoid unsourced market claims.
  const buildDefaultFaq = (): NonNullable<LandingData['faq']> => ([
    { q: 'How should I assess competition for a home?', a: 'Review the current days on market, price changes, seller instructions, property condition, and recent nearby sales. Competition is property-specific and can change faster than a citywide summary.' },
    { q: 'What is the current average days on market?', a: stats.daysOnMarket ? stats.daysOnMarket + ' days across the active search set at the latest MLS refresh. Individual listings can differ substantially.' : 'The current feed does not provide a reliable aggregate for this search. Review days on market on each listing and verify it before making an offer.' }
  ])
  let faq: NonNullable<LandingData['faq']>
  switch (landingDef?.faqKey) {
    case 'faq_condos_for_sale':
      faq = [
        { q: 'What HOA fees should I expect?', a: 'HOA dues vary by property and may cover different services. Review the current statement, budget, reserves, insurance, assessments, minutes, litigation, and governing documents before buying.' },
        { q: 'How should I compare newer and older buildings?', a: 'Compare structure, systems, reserves, insurance, seismic or safety work, maintenance history, unit size, parking, and planned assessments. Building age alone does not establish condition or value.' }
      ]
      break
    case 'faq_homes_with_pool':
      faq = [
        { q: 'How much does pool ownership cost?', a: 'Service, water, energy, insurance, repairs, and equipment replacement depend on the pool and property. Obtain property-specific inspections and quotes during due diligence.' },
        { q: 'Do pool homes sell faster?', a: 'A pool can help or narrow demand depending on location, lot, condition, safety, and buyer needs. Compare recent nearby pool-home sales rather than assuming a universal premium.' }
      ]
      break
    case 'faq_luxury_homes':
      faq = [
        { q: 'What defines a luxury home locally?', a: 'Luxury is market-relative. Location, lot, architecture, privacy, view, condition, amenities, and scarcity should be compared with recent high-end sales in the same micro-market.' },
        { q: 'How should I evaluate luxury inventory?', a: 'Separate turnkey, land-value, view, waterfront, and architecturally significant properties. Marketing labels are not substitutes for condition, permits, disclosures, and comparable sales.' }
      ]
      break
    case 'faq_homes_under_500k':
      faq = [
        { q: 'Is under $500k realistic here?', a: 'Entry-level inventory is competitive; expect tradeoffs in size, age, or location.' },
        { q: 'Can I use FHA or VA financing?', a: 'Eligibility depends on the borrower, property, project approval where applicable, appraisal, condition, and lender requirements. Confirm the specific property with a qualified lender before relying on a loan program.' }
      ]
      break
    case 'faq_homes_over_1m':
      faq = [
        { q: 'What features are common over $1M?', a: 'Often larger lots, upgraded kitchens, outdoor living, or prime locations.' },
        { q: 'Do high-end homes take longer to sell?', a: 'Marketing time varies by price, condition, uniqueness, location, and seller strategy. Review the current listing history and directly comparable recent sales for the property.' }
      ]
      break
    case 'faq_2_bed_apartments':
      faq = [
        { q: 'How should I evaluate a 2-bedroom unit as an investment?', a: 'Verify permitted use, rent and occupancy rules, HOA restrictions, taxes, insurance, maintenance, vacancy assumptions, and realistic market rent with qualified professionals.' },
        { q: 'Do most units include parking?', a: 'Parking is listing-specific. Confirm whether spaces are deeded, assigned, leased, tandem, restricted, or subject to association rules in the title and HOA documents.' }
      ]
      break
    default:
      faq = buildDefaultFaq()
  }
  const relatedCitySlug = cityOrState.toLowerCase().replace(/\s+/g, '-')
  const related: NonNullable<LandingData['related']> = [
    { label: `${titleCase(cityOrState)} Condos`, href: `/california/${relatedCitySlug}/condos-for-sale` },
    { label: `${titleCase(cityOrState)} Homes with Pool`, href: `/california/${relatedCitySlug}/homes-with-pool` },
    { label: 'Under 500K', href: `/california/${relatedCitySlug}/homes-under-500k` }
  ]

  const seoTitleBase = kind.replace(/-/g, ' ')
  const seo: LandingData['seo'] = landingDef ? {
    title: landingDef.title(cityOrState),
    description: landingDef.description(cityOrState),
    canonical: landingDef.canonicalPath(cityOrState.toLowerCase().replace(/\s+/g,'-'))
  } : {
    title: `${titleCase(cityOrState)} ${titleCase(seoTitleBase)}`,
    description: `Explore current ${titleCase(cityOrState)} ${seoTitleBase} listings, available market statistics, and local housing information.`,
    canonical: `/${cityOrState}/${kind}`
  }

  const introHtml = `<p>Browse active ${seoTitleBase} in ${titleCase(cityOrState)}. Updated listing data includes pricing, photos, and key property details.</p>`

  const rawHero = featured[0]?.img
  const heroImage: string | undefined = rawHero ?? undefined

  // ── Resolve related cities from the same county (zero DB cost) ─────────
  //
  // Look up sibling cities from the pre-built static map.  For state-level
  // queries (e.g. cityOrState === 'California') or unknown city names the
  // lookup misses and we fall back to a curated CA-wide shortlist.
  const cityKey = cityOrState.trim().toLowerCase()
  const siblingCities = CITY_COUNTY_SIBLINGS.get(cityKey)
  const relatedCities: NonNullable<LandingData['relatedCities']> =
    siblingCities && siblingCities.length > 0
      ? siblingCities.slice(0, 8) // cap at 8 to keep the UI tight
      : [
          // CA-wide fallbacks for state-level queries or un-mapped cities
          { city: 'San Diego',     state: 'CA', href: '/california/san-diego/homes-for-sale'     },
          { city: 'Los Angeles',   state: 'CA', href: '/california/los-angeles/homes-for-sale'   },
          { city: 'Irvine',        state: 'CA', href: '/california/irvine/homes-for-sale'        },
          { city: 'Santa Barbara', state: 'CA', href: '/california/santa-barbara/homes-for-sale' },
          { city: 'Newport Beach', state: 'CA', href: '/california/newport-beach/homes-for-sale' },
        ]

  landingDebug('🎯 [getLandingData] Final return data:', {
    city: cityOrState,
    kind,
    seoTitle: seo?.title,
    introHtmlLength: introHtml?.length || 0,
    faqCount: faq?.length || 0,
    featuredCount: featured?.length || 0
  })

  return {
    kind,
    city: cityOrState,
    heroImage, // coerced to string | undefined (no null)
    introHtml,
    stats,
    featured,
    neighborhoods,
    schools,
    trends,
    faq,
    related,
    amenities: [] as NonNullable<LandingData['amenities']>, // TODO
    transportation: {} as NonNullable<LandingData['transportation']>, // TODO
    weather: {} as NonNullable<LandingData['weather']>, // TODO
    demographics: {} as NonNullable<LandingData['demographics']>, // TODO
    economics: {} as NonNullable<LandingData['economics']>, // TODO
    crime: {} as NonNullable<LandingData['crime']>, // TODO
    businessDirectory: [] as NonNullable<LandingData['businessDirectory']>, // TODO
    relatedCities, // populated from CITY_COUNTY_SIBLINGS static map (zero DB cost)
    seo
  }
}

function titleCase(str: string) {
  return str.split(/[-\s]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// Helper to debug available cities (not used in production rendering)
export async function listActiveCities(limit = 25): Promise<Array<{ city: string; count: number }>> {
  const pool = await getPgPool()
  const { rows } = await pool.query(
    `SELECT LOWER(city) AS city, COUNT(*)::int AS count
     FROM properties
     WHERE standard_status = 'Active'
       AND property_type NOT IN ('Land','ResidentialLease','CommercialLease','CommercialSale','BusinessOpportunity')
       AND city IS NOT NULL
     GROUP BY 1 ORDER BY count DESC LIMIT $1`,
    [limit]
  )
  return rows
}
