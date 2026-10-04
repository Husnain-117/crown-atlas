import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

import { resolveCityHeroImage } from "@/lib/city-hero-images"
import { getCounty } from "@/lib/counties"
import { CITY_CARD_IMAGE_MAPPING } from "@/lib/location-images"
import { LOS_ANGELES_CITY_IMAGES } from "@/lib/los-angeles-city-images"

const countyCities = getCounty("los-angeles")?.cities ?? []
const entries = Object.entries(LOS_ANGELES_CITY_IMAGES)
const sources = entries.map(([, image]) => image.src)

assert.equal(countyCities.length, 88)
assert.equal(entries.length, countyCities.length)
assert.equal(new Set(sources).size, entries.length)
assert.deepEqual(
  new Set(entries.map(([slug]) => slug)),
  new Set(countyCities.map((city) => city.slug)),
)

for (const [slug, image] of entries) {
  assert.match(image.src, /^\/city\/los-angeles-county\/[a-z-]+\.webp$/)
  assert.equal(CITY_CARD_IMAGE_MAPPING[slug], image.src)
  assert.equal(resolveCityHeroImage(slug)?.imageUrl, image.src)
  assert.doesNotMatch(image.src, /\/County\/Los-angelous\//i)
  assert.match(image.sourceUrl, /^https:\/\/commons\.wikimedia\.org\//)
  assert.match(image.licenseUrl, /^https:\/\//)

  const filePath = path.join(process.cwd(), "public", image.src)
  assert.ok(fs.existsSync(filePath), `${slug} image is missing`)
  assert.ok(fs.statSync(filePath).size > 40_000, `${slug} image is unexpectedly small`)
}

assert.equal(LOS_ANGELES_CITY_IMAGES["long-beach-ca"].attractionLabel, "Long Beach Skyline")
assert.equal(LOS_ANGELES_CITY_IMAGES["pasadena-ca"].city, "Pasadena")
assert.equal(LOS_ANGELES_CITY_IMAGES["rolling-hills-ca"].city, "Rolling Hills")

console.log("losAngelesCityImages.test.ts passed")
