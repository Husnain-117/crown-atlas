import { getPool } from "@/lib/db"
import { SITE_URL } from "@/lib/constants/site"
import { propertyPathFor } from "@/lib/property-url"
import {
  ACTIVE_SALE_LISTING_SQL,
  LISTING_SITEMAP_SHARD_SIZE,
  NORMALIZED_COUNTY_SQL,
  countyNameFromSitemapSlug,
  escapeSitemapXml,
  parseListingSitemapShard,
  sitemapXmlResponse,
} from "@/lib/seo/listing-sitemaps"

interface SitemapListingRow {
  property_entity_key: string
  listing_key: string
  unparsed_address: string | null
  city: string | null
  state_or_province: string | null
  postal_code: string | null
  main_photo_url: string | null
  media_urls: unknown
  last_modified: string | Date | null
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ county: string; shard: string }> }
) {
  const { county, shard: rawShard } = await params
  const countyName = countyNameFromSitemapSlug(county)
  const shard = parseListingSitemapShard(rawShard)
  if (!countyName || !shard) return new Response("Sitemap shard not found", { status: 404 })

  try {
    const pool = await getPool()
    const offset = (shard - 1) * LISTING_SITEMAP_SHARD_SIZE
    const result = await pool.query<SitemapListingRow>(
      `
        WITH canonical_listings AS (
          SELECT DISTINCT ON (COALESCE(NULLIF(property_entity_key, ''), listing_key))
            COALESCE(NULLIF(property_entity_key, ''), listing_key) AS property_entity_key,
            listing_key,
            unparsed_address,
            city,
            county_or_parish,
            state_or_province,
            postal_code,
            main_photo_url,
            media_urls,
            COALESCE(modification_timestamp, price_change_timestamp, updated_at, created_at) AS last_modified
          FROM properties
          WHERE ${ACTIVE_SALE_LISTING_SQL}
          ORDER BY
            COALESCE(NULLIF(property_entity_key, ''), listing_key),
            COALESCE(modification_timestamp, updated_at, created_at) DESC NULLS LAST,
            listing_key DESC
        )
        SELECT *
        FROM canonical_listings
        WHERE ${NORMALIZED_COUNTY_SQL} = $1
        ORDER BY property_entity_key
        LIMIT $2 OFFSET $3
      `,
      [countyName, LISTING_SITEMAP_SHARD_SIZE, offset]
    )

    if (result.rows.length === 0) return new Response("Sitemap shard not found", { status: 404 })

    const urls = result.rows.map((listing) => {
      const address = listing.unparsed_address || "Property"
      const path = propertyPathFor({
        property_entity_key: listing.property_entity_key,
        listing_key: listing.listing_key,
        address,
        city: listing.city,
        state: listing.state_or_province,
        postal_code: listing.postal_code,
      })
      const lastmod = validSitemapDate(listing.last_modified)
      const image = firstStoredImage(listing)
      const imageTag = image
        ? `<image:image><image:loc>${escapeSitemapXml(image)}</image:loc><image:title>${escapeSitemapXml(address)}</image:title></image:image>`
        : ""

      return `<url><loc>${escapeSitemapXml(`${SITE_URL}${path}`)}</loc><lastmod>${lastmod}</lastmod><changefreq>daily</changefreq><priority>0.8</priority>${imageTag}</url>`
    }).join("")

    return sitemapXmlResponse(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}</urlset>`
    )
  } catch (error) {
    console.error("Error generating listing sitemap shard:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

function validSitemapDate(value: string | Date | null): string {
  const date = value ? new Date(value) : new Date()
  return Number.isNaN(date.getTime())
    ? new Date().toISOString()
    : date.toISOString()
}

function firstStoredImage(listing: SitemapListingRow): string | null {
  if (listing.main_photo_url) return listing.main_photo_url
  if (Array.isArray(listing.media_urls)) {
    const image = listing.media_urls.find((value): value is string => typeof value === "string" && value.length > 0)
    return image ?? null
  }
  if (typeof listing.media_urls !== "string") return null
  try {
    const parsed = JSON.parse(listing.media_urls)
    return Array.isArray(parsed) && typeof parsed[0] === "string" ? parsed[0] : null
  } catch {
    return null
  }
}
