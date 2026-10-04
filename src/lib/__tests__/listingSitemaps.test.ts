import assert from "node:assert/strict"
import {
  countyNameFromSitemapSlug,
  countySitemapSlug,
  escapeSitemapXml,
  listingSitemapShardCount,
  normalizeCountyName,
  parseListingSitemapShard,
  sitemapXmlResponse,
} from "../seo/listing-sitemaps"

assert.equal(normalizeCountyName("San Diego County"), "san diego")
assert.equal(countySitemapSlug("San Luis Obispo County"), "san-luis-obispo")
assert.equal(countyNameFromSitemapSlug("san-luis-obispo"), "san luis obispo")
assert.equal(countyNameFromSitemapSlug("../invalid"), null)
assert.equal(listingSitemapShardCount(0), 0)
assert.equal(listingSitemapShardCount(10_000), 1)
assert.equal(listingSitemapShardCount(10_001), 2)
assert.equal(parseListingSitemapShard("2.xml"), 2)
assert.equal(parseListingSitemapShard("0.xml"), null)
assert.equal(escapeSitemapXml("A&B"), "A&amp;B")
assert.equal(sitemapXmlResponse("<xml />").headers.get("Vercel-Cache-Tag"), "properties")

console.log("listing sitemap tests passed")
