import { PROPERTY_CACHE_TAG } from "@/lib/cache/public-cache"

export const LISTING_SITEMAP_SHARD_SIZE = 10_000

export const ACTIVE_SALE_LISTING_SQL = `
  standard_status = 'Active'
  AND property_type NOT IN (
    'Land',
    'ResidentialLease',
    'CommercialLease',
    'CommercialSale',
    'BusinessOpportunity'
  )
  AND LOWER(COALESCE(state_or_province, '')) = 'ca'
`

export const NORMALIZED_COUNTY_SQL =
  "LOWER(TRIM(REGEXP_REPLACE(COALESCE(county_or_parish, ''), '\\s+county$', '', 'i')))"

export function normalizeCountyName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+county$/i, "")
}

export function countySitemapSlug(value: string): string {
  return normalizeCountyName(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function countyNameFromSitemapSlug(value: string): string | null {
  const slug = value.trim().toLowerCase()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null
  return slug.replace(/-/g, " ")
}

export function listingSitemapShardCount(total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0
  return Math.ceil(total / LISTING_SITEMAP_SHARD_SIZE)
}

export function parseListingSitemapShard(value: string): number | null {
  const match = value.match(/^(\d+)(?:\.xml)?$/)
  if (!match) return null
  const shard = Number.parseInt(match[1], 10)
  return Number.isSafeInteger(shard) && shard > 0 ? shard : null
}

export function escapeSitemapXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export function sitemapXmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Vercel-CDN-Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Vercel-Cache-Tag": PROPERTY_CACHE_TAG,
    },
  })
}
