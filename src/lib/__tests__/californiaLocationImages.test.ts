import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

import {
  CALIFORNIA_CITY_IMAGES,
  CALIFORNIA_COUNTY_IMAGES,
  CALIFORNIA_LOCATION_IMAGE_RECORDS,
} from "@/lib/california-location-images"
import { COUNTIES } from "@/lib/counties"

const configuredCities = COUNTIES.flatMap((county) =>
  county.cities.map((city) => ({ ...city, countySlug: county.slug }))
)
const generatedCities = configuredCities.filter(
  (city) => city.countySlug !== "los-angeles" && city.countySlug !== "san-diego"
)
const citySlugs = configuredCities.map((city) => city.slug)

assert.equal(COUNTIES.length, 58, "California must have all 58 counties")
assert.equal(configuredCities.length, 514, "Expected the audited city/community inventory")
assert.equal(new Set(citySlugs).size, citySlugs.length, "City slugs must be unique")
assert.equal(
  CALIFORNIA_LOCATION_IMAGE_RECORDS.filter((record) => record.kind === "county").length,
  58
)
assert.equal(
  CALIFORNIA_LOCATION_IMAGE_RECORDS.filter((record) => record.kind === "city").length,
  generatedCities.length
)

for (const county of COUNTIES) {
  assert.ok(county.cities.length > 0, `${county.name} must have a browsable community`)
  const image = CALIFORNIA_COUNTY_IMAGES[county.slug]
  assert.ok(image, `Missing county image for ${county.slug}`)
  assert.match(image.src, /^\/County\/california\/[a-z0-9-]+\.webp$/)
  assert.ok(fs.statSync(path.join(process.cwd(), "public", image.src)).size > 1_000)
}

for (const city of configuredCities) {
  const image = CALIFORNIA_CITY_IMAGES[city.slug]
  assert.ok(image, `Missing city image for ${city.countySlug}/${city.slug}`)
  assert.ok(fs.statSync(path.join(process.cwd(), "public", image.src)).size > 1_000)
  assert.match(image.sourceUrl, /^https:\/\/commons\.wikimedia\.org\//)
  assert.match(image.licenseUrl, /^https:\/\//)
}

const fresno = COUNTIES.find((county) => county.slug === "fresno")!
const merced = COUNTIES.find((county) => county.slug === "merced")!
assert.ok(fresno.cities.some((city) => city.slug === "san-joaquin-ca"))
assert.ok(!fresno.cities.some((city) => city.slug === "dos-palos-ca"))
assert.ok(merced.cities.some((city) => city.slug === "dos-palos-ca"))

for (const record of CALIFORNIA_LOCATION_IMAGE_RECORDS) {
  assert.match(record.sourceUrl, /^https:\/\/commons\.wikimedia\.org\//)
  assert.match(record.licenseUrl, /^https:\/\//)
  assert.ok(record.creator)
  assert.ok(record.alt)
}

console.log(
  `California location images verified: ${COUNTIES.length} counties, ${configuredCities.length} cities and communities`
)
