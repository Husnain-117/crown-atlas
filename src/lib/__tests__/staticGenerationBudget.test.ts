import assert from "node:assert/strict"
import {
  PRIORITY_CITY_SLUGS,
  PRIORITY_CLUSTER_SLUGS,
  PRIORITY_COUNTY_SLUGS,
  PRIORITY_LANDING_SLUGS,
} from "@/lib/seo/priority-locations"
import { LANDINGS_BY_SLUG } from "@/lib/landing/defs"
import { getLocalMarketEditorial } from "@/lib/seo/local-market-editorial"
import { isCACitySlug } from "@/lib/seo/cities"

const plannedPriorityPages =
  PRIORITY_CITY_SLUGS.length * PRIORITY_LANDING_SLUGS.length +
  PRIORITY_CITY_SLUGS.length * PRIORITY_CLUSTER_SLUGS.length +
  PRIORITY_CITY_SLUGS.length +
  PRIORITY_COUNTY_SLUGS.length

assert.ok(
  plannedPriorityPages <= 200,
  `Priority static route budget exceeded: ${plannedPriorityPages} > 200`
)

assert.equal(new Set(PRIORITY_CITY_SLUGS).size, PRIORITY_CITY_SLUGS.length)
assert.equal(new Set(PRIORITY_LANDING_SLUGS).size, PRIORITY_LANDING_SLUGS.length)
assert.equal(new Set(PRIORITY_CLUSTER_SLUGS).size, PRIORITY_CLUSTER_SLUGS.length)

const marketOverviews = PRIORITY_CITY_SLUGS.map((city) => {
  const editorial = getLocalMarketEditorial(city)
  assert.ok(editorial, `Missing local market editorial for ${city}`)
  assert.match(editorial.officialUrl, /^https:\/\//)
  assert.equal(editorial.reviewPoints.length, 3)
  return editorial.overview
})

assert.equal(new Set(marketOverviews).size, marketOverviews.length, "Market overviews must be unique")
for (const landing of PRIORITY_LANDING_SLUGS) {
  assert.ok(LANDINGS_BY_SLUG[landing], `Missing landing definition for ${landing}`)
}

assert.equal(isCACitySlug("san-diego"), true)
assert.equal(isCACitySlug("stanton"), true)
assert.equal(isCACitySlug("not-a-real-city"), false)

console.log(`Static priority route budget: ${plannedPriorityPages}/200`)
