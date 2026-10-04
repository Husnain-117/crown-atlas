import { NextRequest } from "next/server"
import { middleware } from "../../middleware"
import assert from "node:assert/strict"
import {
  canonicalCityBuyPath,
  canonicalCityBuyPathFor,
  canonicalCityFacetPath,
  legacyClusterTarget,
  legacyDiscoverTarget,
  resolveCanonicalCityLocation,
} from "../seo/location-canonical"

const carlsbad = resolveCanonicalCityLocation("carlsbad")
assert.ok(carlsbad)
assert.equal(carlsbad.city.slug, "carlsbad-ca")
assert.equal(canonicalCityBuyPath(carlsbad), "/buy/san-diego/carlsbad-ca")

const richmondDistrict = resolveCanonicalCityLocation("richmond")
assert.ok(richmondDistrict)
assert.equal(richmondDistrict.city.name, "Richmond District")

const richmondCity = resolveCanonicalCityLocation("richmond-ca")
assert.ok(richmondCity)
assert.equal(richmondCity.city.name, "Richmond")
assert.equal(canonicalCityFacetPath(carlsbad, "condos-for-sale"), "/california/carlsbad/condos-for-sale")

assert.equal(legacyDiscoverTarget("san-diego"), "/buy/san-diego")
assert.equal(legacyDiscoverTarget("san-diego-ca"), "/buy/san-diego/san-diego-ca")
assert.equal(legacyDiscoverTarget("carlsbad"), "/buy/san-diego/carlsbad-ca")
assert.equal(legacyDiscoverTarget("not-a-real-place"), null)
assert.equal(legacyClusterTarget("carlsbad", "condos-for-sale"), "/california/carlsbad/condos-for-sale")
assert.equal(legacyClusterTarget("carlsbad", "houses-for-sale"), "/buy/san-diego/carlsbad-ca")
assert.equal(legacyClusterTarget("carlsbad", "under-1m"), "/buy/san-diego/carlsbad-ca")

console.log("location canonical tests passed")

assert.equal(canonicalCityBuyPathFor("La Jolla", "San Diego"), "/buy/san-diego/la-jolla-ca")
assert.equal(canonicalCityBuyPathFor("Newport Beach", "Orange County"), "/buy/orange/newport-beach-ca")
assert.equal(canonicalCityBuyPathFor("San Diego, CA"), "/buy/san-diego/san-diego-ca")
assert.equal(canonicalCityBuyPathFor("Richmond", "Contra Costa"), "/buy/contra-costa/richmond-ca")
assert.equal(canonicalCityBuyPathFor("La Jolla", "Orange"), null)
assert.equal(canonicalCityBuyPathFor("Invented Place"), null)
assert.equal(canonicalCityBuyPathFor(""), null)

async function verifyRouteResponses() {
  for (const [path, destination] of [
    ["/discover/san-diego", "/buy/san-diego"],
    ["/discover/carlsbad", "/buy/san-diego/carlsbad-ca"],
    ["/discover/carlsbad/condos-for-sale", "/california/carlsbad/condos-for-sale"],
    ["/california/la-jolla/homes-for-sale", "/buy/san-diego/la-jolla-ca"],
    ["/california/san-diego/homes-for-sale", "/buy/san-diego/san-diego-ca"],
  ]) {
    const response = await middleware(new NextRequest(`https://crowncoastalhomes.com${path}?utm_source=test`))
    assert.equal(response.status, 308, path)
    assert.equal(response.headers.get("location"), `https://crowncoastalhomes.com${destination}?utm_source=test`)
  }
  for (const path of [
    "/discover/san-diego/neighborhoods",
    "/california/la-jolla/luxury-homes",
    "/california/newport-beach/ocean-view-homes",
  ]) {
    const response = await middleware(new NextRequest(`https://crowncoastalhomes.com${path}`))
    assert.equal(response.headers.get("location"), null, `Keep specialist route: ${path}`)
  }
  const missing = await middleware(new NextRequest("https://crowncoastalhomes.com/california/not-a-place/homes-for-sale"))
  assert.equal(missing.status, 404)
  console.log("location redirects: HTTP 308, query preservation and specialty routes passed")
}
void verifyRouteResponses().catch(error => { console.error(error); process.exitCode = 1 })
