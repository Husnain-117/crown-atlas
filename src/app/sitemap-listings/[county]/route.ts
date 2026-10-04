import { getPool } from "@/lib/db"
import { SITE_URL } from "@/lib/constants/site"
import {
  ACTIVE_SALE_LISTING_SQL,
  NORMALIZED_COUNTY_SQL,
  countyNameFromSitemapSlug,
  escapeSitemapXml,
  listingSitemapShardCount,
  sitemapXmlResponse,
} from "@/lib/seo/listing-sitemaps"

/** Backward-compatible county sitemap index. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ county: string }> }
) {
  const { county } = await params
  const countyName = countyNameFromSitemapSlug(county)
  if (!countyName) return new Response("County not found", { status: 404 })

  try {
    const pool = await getPool()
    const result = await pool.query<{ total: string }>(
      `
        WITH canonical_listings AS (
          SELECT DISTINCT ON (COALESCE(NULLIF(property_entity_key, ''), listing_key))
            COALESCE(NULLIF(property_entity_key, ''), listing_key) AS property_entity_key,
            county_or_parish
          FROM properties
          WHERE ${ACTIVE_SALE_LISTING_SQL}
          ORDER BY
            COALESCE(NULLIF(property_entity_key, ''), listing_key),
            COALESCE(modification_timestamp, updated_at, created_at) DESC NULLS LAST,
            listing_key DESC
        )
        SELECT COUNT(*)::bigint AS total
        FROM canonical_listings
        WHERE ${NORMALIZED_COUNTY_SQL} = $1
      `,
      [countyName]
    )
    const total = Number(result.rows[0]?.total ?? 0)
    const shardCount = listingSitemapShardCount(total)
    const entries = Array.from({ length: shardCount }, (_, index) => {
      const loc = `${SITE_URL}/sitemap-listings/${county}/${index + 1}.xml`
      return `<sitemap><loc>${escapeSitemapXml(loc)}</loc></sitemap>`
    }).join("")

    return sitemapXmlResponse(
      `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</sitemapindex>`
    )
  } catch (error) {
    console.error("Error generating county listing sitemap index:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
