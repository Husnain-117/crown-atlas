#!/usr/bin/env node

import {
  createPool,
  loadEnvironment,
} from "../ops/trestle-sync/worker-lib.mjs"

loadEnvironment()

const baseUrl = String(process.argv[2] || process.env.SITEMAP_INVENTORY_BASE_URL || "https://crowncoastalhomes.com").replace(/\/$/, "")
const pool = createPool()

try {
  const expectedResult = await pool.query(`
    SELECT COUNT(DISTINCT COALESCE(NULLIF(property_entity_key, ''), listing_key))::bigint AS total
    FROM properties
    WHERE standard_status = 'Active'
      AND property_type NOT IN ('Land','ResidentialLease','CommercialLease','CommercialSale','BusinessOpportunity')
      AND LOWER(COALESCE(state_or_province, '')) = 'ca'
  `)
  const expected = Number(expectedResult.rows[0]?.total ?? 0)

  const indexXml = await fetchXml(`${baseUrl}/sitemap-listings.xml`)
  const shards = xmlLocations(indexXml)
  const allUrls = []
  for (const shard of shards) {
    const xml = await fetchXml(shard)
    allUrls.push(...xmlLocations(xml))
  }

  const unique = new Set(allUrls)
  const duplicates = allUrls.length - unique.size
  const coverage = expected > 0 ? unique.size / expected : 0
  const invalidCanonicalKeys = [...unique].filter((url) => !/\/[a-f0-9]{32}$/.test(new URL(url).pathname))
  const failures = []
  if (duplicates > 0) failures.push(`${duplicates} duplicate property URLs`)
  if (coverage < 0.999) failures.push(`coverage ${(coverage * 100).toFixed(2)}% is below 99.9%`)
  if (unique.size > expected) failures.push(`${unique.size - expected} more sitemap URLs than active entities`)
  if (invalidCanonicalKeys.length) failures.push(`${invalidCanonicalKeys.length} URLs do not use stable entity keys`)

  console.log(JSON.stringify({
    expectedActiveEntities: expected,
    sitemapUrls: allUrls.length,
    uniqueSitemapUrls: unique.size,
    duplicates,
    coveragePercent: Number((coverage * 100).toFixed(4)),
    shards: shards.length,
    invalidCanonicalKeys: invalidCanonicalKeys.length,
  }, null, 2))

  if (failures.length) throw new Error(failures.join("; "))
} finally {
  await pool.end()
}

async function fetchXml(url) {
  const response = await fetch(url, { headers: { "User-Agent": "CrownCoastalSitemapCoverage/1.0" } })
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`)
  return response.text()
}

function xmlLocations(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decodeXml(match[1]))
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}
