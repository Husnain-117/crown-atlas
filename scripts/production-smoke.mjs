import assert from "node:assert/strict"

const baseUrl = (
  process.env.SMOKE_BASE_URL ||
  process.argv[2] ||
  "https://crowncoastalhomes.com"
).replace(/\/+$/, "")

async function request(path, options = {}) {
  const response = await fetch(baseUrl + path, {
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
    ...options,
  })
  const text = await response.text()
  return { response, text }
}

function expectStatus(result, path, expected = 200) {
  assert.equal(
    result.response.status,
    expected,
    path + " returned " + result.response.status + " instead of " + expected
  )
}

function propertySlug(property) {
  return [
    property.address,
    property.city,
    property.state || "CA",
    property.postal_code,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

console.log("Production smoke target:", baseUrl)

const home = await request("/")
expectStatus(home, "/")
assert.match(home.text, /<meta[^>]+name="description"/i, "Homepage metadata description is missing")
assert.match(home.text, /Luxury Coastal Homes/i, "Homepage primary content is missing")

const contact = await request("/contact")
expectStatus(contact, "/contact")

const propertiesFirst = await request("/api/properties?limit=1&sortBy=updated")
expectStatus(propertiesFirst, "/api/properties")
const propertiesPayload = JSON.parse(propertiesFirst.text)
assert.equal(propertiesPayload.success, true, "Property API did not return success")
assert.ok(Array.isArray(propertiesPayload.data), "Property API data is not an array")
assert.ok(propertiesPayload.data.length > 0, "Property API returned no production listing")

const propertiesSecond = await request("/api/properties?limit=1&sortBy=updated")
expectStatus(propertiesSecond, "/api/properties second request")
const secondCache = propertiesSecond.response.headers.get("x-data-cache")
assert.ok(secondCache, "Property API did not expose X-Data-Cache")
const secondVercelCache = propertiesSecond.response.headers.get("x-vercel-cache") || ""
assert.match(secondVercelCache, /^(HIT|STALE)$/i, "Property API did not reach the Vercel CDN cache")
console.log("Property data cache status:", secondCache)
console.log("Property Vercel cache status:", secondVercelCache)
console.log("Property server timing:", propertiesSecond.response.headers.get("server-timing") || "missing")

const property = propertiesPayload.data[0]
assert.match(
  property.property_entity_key || "",
  /^[a-f0-9]{32}$/,
  "Property API did not return a stable entity key"
)
const legacyPropertyPath = "/properties/" + propertySlug(property) + "/" + property.listing_key
const legacyProperty = await request(legacyPropertyPath, { redirect: "manual" })
assert.ok(
  [307, 308].includes(legacyProperty.response.status),
  legacyPropertyPath + " did not permanently redirect to the entity URL"
)
const redirectLocation = legacyProperty.response.headers.get("location") || ""
assert.ok(
  redirectLocation.endsWith("/" + property.property_entity_key),
  "Legacy property redirect does not use the stable entity key"
)

const propertyPath = "/properties/" + propertySlug(property) + "/" + property.property_entity_key
const propertyPage = await request(propertyPath)
expectStatus(propertyPage, propertyPath)
assert.match(
  propertyPage.response.headers.get("cache-control") || "",
  /s-maxage=3600/,
  "Property page is not configured for one-hour ISR caching"
)
assert.match(
  propertyPage.text,
  new RegExp('<link rel="canonical" href="[^"]+/' + property.property_entity_key + '"'),
  "Property canonical does not use the stable entity key"
)
assert.match(propertyPage.text, /Property history and records/i, "Property history section is missing")

const openHouses = await request("/api/properties?openHousesOnly=true&limit=1")
expectStatus(openHouses, "/api/properties?openHousesOnly=true")
const openHousePayload = JSON.parse(openHouses.text)
assert.equal(openHousePayload.success, true, "Open House property search did not return success")
assert.ok(openHousePayload.data.length > 0, "Open House property search returned no upcoming listing")

const sitemap = await request("/sitemap.xml")
expectStatus(sitemap, "/sitemap.xml")
const sitemapCount = (sitemap.text.match(/<loc>/g) || []).length
assert.ok(sitemapCount > 100, "Sitemap unexpectedly small: " + sitemapCount)
assert.ok(sitemapCount <= 600, "Sitemap quality budget exceeded: " + sitemapCount)
console.log("Sitemap URL count:", sitemapCount)

const listingSitemapIndex = await request("/sitemap-listings.xml")
expectStatus(listingSitemapIndex, "/sitemap-listings.xml")
const listingShards = [...listingSitemapIndex.text.matchAll(/<loc>(.*?)<\/loc>/g)]
  .map((match) => match[1].replace(/&amp;/g, "&"))
assert.ok(listingShards.length > 0, "Listing sitemap index has no shards")
const firstListingShard = await fetch(listingShards[0], { signal: AbortSignal.timeout(20_000) })
assert.equal(firstListingShard.status, 200, "First listing sitemap shard is unavailable")
const firstListingShardXml = await firstListingShard.text()
assert.match(
  firstListingShardXml,
  /\/properties\/[^<]+\/[a-f0-9]{32}<\/loc>/,
  "Listing sitemap does not use stable property entity URLs"
)

const robots = await request("/robots.txt")
expectStatus(robots, "/robots.txt")
assert.match(robots.text, /sitemap:/i, "robots.txt does not advertise the sitemap")
assert.match(robots.text, /sitemap-listings\.xml/i, "robots.txt does not advertise listing sitemaps")

const monitoring = await request("/api/monitoring/status?deep=1")
expectStatus(monitoring, "/api/monitoring/status?deep=1")
const monitoringPayload = JSON.parse(monitoring.text)
assert.equal(monitoringPayload.status, "ok", "Production monitoring reports a degraded service")

const leadMonitorAuth = await request("/api/monitoring/lead-delivery", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ source: "unauthorized-smoke" }),
})
expectStatus(leadMonitorAuth, "/api/monitoring/lead-delivery unauthorized", 401)

const csp = home.response.headers.get("content-security-policy-report-only")
assert.ok(csp && csp.includes("/api/csp-report"), "CSP report-only policy is missing")

console.log("Production smoke passed")
