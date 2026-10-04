import { unstable_cache } from "next/cache"
import { Property } from "@/interfaces"
import { getPool, isDatabaseConfigured } from "@/lib/db"
import FeaturedPropertiesSection from "./featured-properties-section"

/**
 * Lean query that only selects the columns needed for property cards.
 * Avoids the heavyweight searchProperties path (which selects agent info,
 * remarks, media_urls, etc.) and skips the COUNT(*) sub-query entirely.
 */
function mapFeaturedProperty(p: Record<string, unknown>): Property {
  const image = typeof p.main_photo_url === "string" ? p.main_photo_url : ""
  const status = typeof p.status === "string" ? p.status : "UNKNOWN"

  return {
    _id: String(p.listing_key),
    id: String(p.listing_key),
    listing_key: String(p.listing_key),
    address: typeof p.unparsed_address === "string" ? p.unparsed_address : "",
    city: typeof p.city === "string" ? p.city : "",
    county: String(p.county_or_parish || p.state || ""),
    state: typeof p.state === "string" ? p.state : "",
    postal_code: typeof p.postal_code === "string" ? p.postal_code : "",
    latitude: Number(p.latitude) || 0,
    longitude: Number(p.longitude) || 0,
    list_price: Number(p.list_price) || 0,
    current_price: Number(p.list_price) || 0,
    bedrooms: Number(p.bedrooms_total) || 0,
    bathrooms: Number(p.bathrooms_total) || 0,
    living_area_sqft: Number(p.living_area) || 0,
    property_type: typeof p.property_type === "string" ? p.property_type : "Residential",
    status: status === "Active" ? "FOR SALE" : status,
    images: image ? [image] : [],
    main_image_url: image,
    image,
    location: typeof p.city === "string" ? p.city : "",
  } as Property
}

const FEATURED_COLUMNS = `
  listing_key,
  list_price,
  city,
  state_or_province AS state,
  county_or_parish,
  postal_code,
  bedrooms_total,
  bathrooms_total_integer AS bathrooms_total,
  living_area,
  property_type,
  standard_status AS status,
  main_photo_url,
  unparsed_address,
  latitude,
  longitude
`

async function getFeaturedPropertiesUncached(): Promise<Property[]> {
  const pool = await getPool()

  const sql = `
      SELECT ${FEATURED_COLUMNS}
      FROM properties
      WHERE standard_status = 'Active'
        AND LOWER(COALESCE(property_type, '')) NOT IN ('land','residentiallease','commerciallease','commercialsale','businessopportunity')
        AND LOWER(COALESCE(state_or_province, '')) IN ('ca', 'california')
        AND main_photo_url IS NOT NULL
      ORDER BY
        CASE WHEN list_price >= 3000000 AND list_price <= 5000000 THEN 0 ELSE 1 END,
        updated_at DESC NULLS LAST
      LIMIT 24
    `

  const result = await pool.query(sql)
  if (result.rows.length > 0) return result.rows.map(mapFeaturedProperty)

  // A broader fallback keeps the conversion section useful if an upstream
  // feed changes state labels or temporarily omits listing photos.
  const fallback = await pool.query(`
    SELECT ${FEATURED_COLUMNS}
    FROM properties
    WHERE standard_status = 'Active'
      AND LOWER(COALESCE(property_type, '')) NOT IN ('land','residentiallease','commerciallease','commercialsale','businessopportunity')
    ORDER BY updated_at DESC NULLS LAST
    LIMIT 12
  `)

  return fallback.rows.map(mapFeaturedProperty)
}

async function getFeaturedPropertiesFallback(): Promise<Property[]> {
  try {
    const pool = await getPool()
    const result = await pool.query(`
      SELECT ${FEATURED_COLUMNS}
      FROM properties
      WHERE standard_status = 'Active'
      ORDER BY updated_at DESC NULLS LAST
      LIMIT 12
    `)
    return result.rows.map(mapFeaturedProperty)
  } catch (error) {
    console.error(
      "Error fetching featured properties:",
      error instanceof Error ? error.message : "Unknown error",
    )
    return []
  }
}

/**
 * Cached wrapper — revalidates every 5 minutes.
 * Featured properties don't need real-time accuracy on the homepage.
 */
async function getFeaturedProperties(): Promise<Property[]> {
  if (!isDatabaseConfigured()) return []

  try {
    return await unstable_cache(
      () => getFeaturedPropertiesUncached(),
      ["featured-properties-homepage-v2"],
      {
        revalidate: 300, // 5 minutes
        tags: ["featured-properties"],
      }
    )()
  } catch {
    // Rejected cache loaders are not persisted, so a transient DB error can
    // recover on the very next request instead of becoming a cached empty UI.
    return getFeaturedPropertiesFallback()
  }
}

/**
 * Server Component that fetches featured properties and renders the section.
 * Intended to be wrapped in a <Suspense> boundary so the page shell
 * can stream immediately without waiting for the database query.
 */
export default async function FeaturedPropertiesServer() {
  const properties = await getFeaturedProperties()

  return <FeaturedPropertiesSection initialProperties={properties} />
}
