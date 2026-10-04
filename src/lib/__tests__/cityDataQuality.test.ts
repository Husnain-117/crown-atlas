import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { citySearchFilters, citySearchPage } from "../landing/city-search"
import { getCityResearch } from "../landing/city-research"
import { isPlaceholderPlace } from "../landing/place-quality"
import { deriveAllowedPlaceNames } from "../../ai/validators/landingOutputValidator"

const db = require("../db")
const { searchProperties, searchPropertiesCursor } = require("../db/property-repo")
const { getCityMetrics } = require("../city-metrics")

async function main() {
  const laJolla = citySearchFilters("la-jolla-ca", "san-diego", "buy")!
  assert.equal(laJolla.city, "La Jolla")
  assert.equal(laJolla.county, "San Diego County")
  assert.equal(laJolla.postalCodes, undefined, "ZIPs must not expand a city search")
  assert.equal(citySearchFilters("la-jolla-ca", "orange", "buy"), null)
  assert.equal(citySearchFilters("made-up-ca", "san-diego", "buy"), null)
  for (const input of ["-1", "NaN", "Infinity", "0"]) assert.equal(citySearchPage(input), 1)
  assert.equal(citySearchPage("2.7"), 2)

  const allowed = deriveAllowedPlaceNames({ city: "La Jolla", state: "CA", local_areas: [{ name: "Not Applicable" }, { name: "Village" }], allowed_place_names: ["Not Listed", "N/A"] } as any)
  assert.ok(allowed.includes("village"))
  assert.ok(!allowed.some(isPlaceholderPlace))
  for (const city of ["san-diego", "la-jolla", "newport-beach", "los-angeles", "malibu", "san-francisco"]) {
    const research = getCityResearch(`${city}-ca`)!
    assert.ok(research.source.href.startsWith("https://"))
    assert.equal(research.checks.length, 3)
    assert.doesNotMatch(JSON.stringify(research), /\$[\d,]+|Not Applicable|Not Listed|February 2026/i)
  }

  const queries: Array<{ sql: string; values: unknown[] }> = []
  let shouldTimeout = false
  db.isDatabaseConfigured = () => true
  db.getPool = db.getPgPool = async () => ({
    query: async (sql: string, values: unknown[] = []) => {
      queries.push({ sql, values })
      if (sql.includes("to_regclass")) return { rows: [{ exists: false }] }
      if (shouldTimeout && sql.includes("listing_agent_email")) { shouldTimeout = false; throw new Error("list-timeout") }
      if (sql.includes("AS active_listings")) return { rows: [{ active_listings: 0, median_price: null, median_price_sqft: null, median_dom: 0, new_listings_7d: 0, snapshot_at: "2026-09-06T09:00:00Z" }] }
      if (sql.includes("COUNT(*)")) return { rows: [{ count: "0" }] }
      return { rows: [] }
    },
  })
  await searchProperties({ ...laJolla, limit: 12, offset: 0 })
  const cityQuery = queries.find(item => item.sql.includes("listing_agent_email"))!
  assert.match(cityQuery.sql, /LOWER\(city\) = LOWER\(\$\d+\)/)
  assert.match(cityQuery.sql, /county_or_parish/)
  assert.ok(cityQuery.values.includes("La Jolla"))
  assert.ok(cityQuery.values.includes("San Diego"))
  assert.ok(!cityQuery.values.some(Array.isArray))

  queries.length = 0
  await searchPropertiesCursor({ ...laJolla, limit: 12 })
  assert.ok(queries.some(item => /LOWER\(city\) = LOWER\(\$\d+\)/.test(item.sql) && item.values.includes("San Diego") && item.values.includes("La Jolla")))

  queries.length = 0
  shouldTimeout = true
  await searchProperties({ ...laJolla, maxPrice: 1_000_000, limit: 12, offset: 0 })
  const retry = queries.find(item => item.sql.includes("listing_key, property_entity_key, standard_status AS status"))!
  assert.ok(retry, "the reduced projection should be retried on timeout")
  assert.ok(retry.values.includes("La Jolla") && retry.values.includes("San Diego") && retry.values.includes(1_000_000))
  assert.match(retry.sql, /LOWER\(city\) = LOWER\(\$\d+\)/)
  assert.match(retry.sql, /list_price <= \$\d+/)

  const metrics = await getCityMetrics({ citySlug: "la-jolla-ca", countySlug: "san-diego" }, "buy")
  assert.equal(metrics.activeListings, 0, "zero inventory must not be replaced with stored historic totals")
  assert.equal(metrics.medianDaysOnMarket, 0, "zero days is a valid metric")
  assert.equal(metrics.available, true)
  assert.equal(metrics.snapshotAt, "2026-09-06T09:00:00.000Z")
  db.isDatabaseConfigured = () => false
  assert.equal((await getCityMetrics({ citySlug: "malibu-ca", countySlug: "los-angeles" }, "buy")).available, false)

  // Publication guard: old generated intros and mixed historical summaries must
  // never become public again through this server component.
  const source = readFileSync("src/app/_components/city/CityDataComponents.tsx", "utf8")
  assert.doesNotMatch(source, /city_seo_content|city_statistics|city_lifestyle_research/)
  assert.doesNotMatch(readFileSync("src/app/_components/city/CitySkeletons.tsx", "utf8"), /<h1\b/)
  console.log("cityDataQuality: all assertions passed")
}

main().catch(error => { console.error(error); process.exitCode = 1 })
