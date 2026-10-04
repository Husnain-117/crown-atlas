import { getPool } from "@/lib/db"
import { SITE_URL } from "@/lib/constants/site"
import {
  ACTIVE_SALE_LISTING_SQL,
  NORMALIZED_COUNTY_SQL,
  countySitemapSlug,
  escapeSitemapXml,
  listingSitemapShardCount,
  sitemapXmlResponse,
} from "@/lib/seo/listing-sitemaps"

export async function GET() {
  try {
    const pool = await getPool()
    const result = await pool.query<{ county_name: string; total: string }>(`
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
      SELECT
        ${NORMALIZED_COUNTY_SQL} AS county_name,
        COUNT(*)::bigint AS total
      FROM canonical_listings
      GROUP BY 1
      ORDER BY 1
    `)

    const entries: string[] = []
    for (const row of result.rows) {
      const countySlug = countySitemapSlug(row.county_name)
      if (!countySlug) continue
      const shards = listingSitemapShardCount(Number(row.total))
      for (let shard = 1; shard <= shards; shard += 1) {
        const loc = `${SITE_URL}/sitemap-listings/${countySlug}/${shard}.xml`
        entries.push(`<sitemap><loc>${escapeSitemapXml(loc)}</loc></sitemap>`)
      }
    }

    return sitemapXmlResponse(
      `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join("")}</sitemapindex>`
    )
  } catch (error) {
    console.error("Error generating global listing sitemap index:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
