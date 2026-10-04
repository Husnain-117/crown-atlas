import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

import { resolveCityHeroImage } from "@/lib/city-hero-images"
import { CITY_CARD_IMAGE_MAPPING } from "@/lib/location-images"
import { SAN_DIEGO_CITY_IMAGES } from "@/lib/san-diego-city-images"

const entries = Object.entries(SAN_DIEGO_CITY_IMAGES)
const sources = entries.map(([, image]) => image.src)

assert.equal(entries.length, 19)
assert.equal(new Set(sources).size, entries.length)

for (const [slug, image] of entries) {
  assert.match(image.src, /^\/city\/san-diego-county\/[a-z-]+\.webp$/)
  assert.equal(CITY_CARD_IMAGE_MAPPING[slug], image.src)
  assert.equal(resolveCityHeroImage(slug)?.imageUrl, image.src)
  assert.doesNotMatch(image.src, /\/Orange\//i)

  const filePath = path.join(process.cwd(), "public", image.src)
  assert.ok(fs.existsSync(filePath), `${slug} image is missing`)
  assert.ok(fs.statSync(filePath).size > 40_000, `${slug} image is unexpectedly small`)
}

assert.equal(SAN_DIEGO_CITY_IMAGES["san-marcos-ca"].city, "San Marcos")
assert.equal(SAN_DIEGO_CITY_IMAGES["la-jolla-ca"].city, "La Jolla")

console.log("sanDiegoCityImages.test.ts passed")
