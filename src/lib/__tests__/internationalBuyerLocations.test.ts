import assert from "node:assert/strict"
import { SITE_URL } from "../constants/site"
import { buyerLocationFaqs, buyerLocationMetadata } from "../international-buyer-location-seo"
import { BUYER_LOCATIONS, getBuyerLocation, relatedBuyerLocations } from "../international-buyer-locations"
import { NORTH_ORANGE_BUYER_LOCATIONS } from "../international-buyer-locations-north-orange"
import { WEST_BUYER_LOCATIONS } from "../international-buyer-locations-west"
import { BUYER_MARKETS, buyerFunnelLanguages } from "../international-buyer-markets"
import type { LocationSource } from "../international-buyer-location-types"

const expectedLocations = {
  "los-angeles": "Los Angeles",
  "san-francisco": "San Francisco",
  "orange-county": "Orange County",
  "beverly-hills": "Beverly Hills",
  malibu: "Malibu",
  "santa-monica": "Santa Monica",
  "long-beach": "Long Beach",
  "newport-beach": "Newport Beach",
  "laguna-beach": "Laguna Beach",
  irvine: "Irvine",
  "san-jose": "San Jose",
  "santa-barbara": "Santa Barbara",
}
const expectedMarkets = {
  uk: { language: "en-GB", locale: "en_GB", path: "/international-buyers/uk", title: /Real Estate Agent.*UK Buyers/, origin: /from the UK/ },
  germany: { language: "de-DE", locale: "de_DE", path: "/international-buyers/germany", title: /Immobilienmakler.*Deutsch/, origin: /Hauskauf in Kalifornien/ },
  canada: { language: "en-CA", locale: "en_CA", path: "/international-buyers/canada", title: /Real Estate Agent.*Canadian Buyers/, origin: /from Canada/ },
} as const
const marketKeys = ["uk", "germany", "canada"] as const

function assertSource(source: LocationSource, context: string) {
  assert.ok(source.label.trim(), `${context}: sources need a visible label`)
  const url = new URL(source.href)
  assert.equal(url.protocol, "https:", `${context}: use an absolute HTTPS source URL`)
  assert.ok(url.hostname.includes("."), `${context}: sources need a public host`)
  assert.equal(url.username + url.password, "", `${context}: source URLs must not contain credentials`)
  assert.doesNotMatch(source.href, /\s/, `${context}: source URLs must not contain raw whitespace`)
}

function assertListingLink(href: string, context: string) {
  assert.match(href, /^\/buy\/[a-z0-9-]+(?:\/[a-z0-9-]+)?$/, `${context}: use a browsable county or city listing route`)
  assert.equal(new URL(href, SITE_URL).origin, SITE_URL, `${context}: listing links stay on the site`)
}

assert.equal(BUYER_LOCATIONS.length, 12)
assert.equal(new Set(BUYER_LOCATIONS.map(location => location.slug)).size, 12, "each new place has one registry entry")
assert.deepEqual(
  Object.fromEntries(BUYER_LOCATIONS.map(location => [location.slug, location.name])),
  expectedLocations,
  "the registry contains the twelve requested places with the correct display names",
)
const sourceLocations = [...WEST_BUYER_LOCATIONS, ...NORTH_ORANGE_BUYER_LOCATIONS]
assert.equal(sourceLocations.length, BUYER_LOCATIONS.length, "the registry must not silently omit source entries")
assert.equal(new Set(sourceLocations.map(location => location.slug)).size, sourceLocations.length, "duplicate source slugs must not be hidden by registry lookup")
assert.equal(getBuyerLocation("not-a-california-buyer-location"), undefined)
assert.equal(getBuyerLocation(""), undefined)
assert.equal(getBuyerLocation("../los-angeles"), undefined)
assert.equal(getBuyerLocation("orange-county")?.kind, "county", "Orange County must not be presented as a city")

for (const market of marketKeys) {
  const expected = expectedMarkets[market]
  assert.equal(BUYER_MARKETS[market].language, expected.language)
  assert.equal(BUYER_MARKETS[market].path, expected.path)
  assert.equal(buyerFunnelLanguages()[expected.language], SITE_URL + expected.path)
  assert.equal(buyerFunnelLanguages(false)[expected.language], SITE_URL + expected.path)
  assert.equal(buyerFunnelLanguages(true)[expected.language], `${SITE_URL}${expected.path}/san-diego`, "the existing San Diego alternate helper remains compatible")
}

for (const location of BUYER_LOCATIONS) {
  assert.equal(getBuyerLocation(location.slug), location)
  assert.match(location.slug, /^[a-z]+(?:-[a-z]+)*$/)
  if (location.slug !== "orange-county") assert.equal(location.kind, "city", location.slug)
  assertListingLink(location.searchHref, location.slug)
  assert.ok(location.imageAlt.trim(), `${location.slug}: the location image has useful alternative text`)
  if (location.parentSlug) {
    assert.notEqual(location.parentSlug, location.slug)
    assert.ok(getBuyerLocation(location.parentSlug), `${location.slug}: the parent guide exists`)
  }

  for (const language of ["en", "de"] as const) {
    const copy = location[language]
    const context = `${location.slug}/${language}`
    assert.ok(copy.intro.trim(), `${context}: the introduction is populated`)
    assert.ok(copy.searchFocus.trim(), `${context}: the search guidance is populated`)
    assert.equal(copy.checks.length, 3, `${context}: three local buyer checks`)
    assert.equal(copy.areas.length, 3, `${context}: three location comparisons`)
    assert.equal(copy.faqs.length, 3, `${context}: three local FAQs before market additions`)
    assert.equal(new Set(copy.checks.map(check => check.title)).size, 3, `${context}: check headings are distinct`)
    assert.equal(new Set(copy.areas.map(area => area.name)).size, 3, `${context}: comparison labels are distinct`)
    assert.equal(new Set(copy.faqs.map(faq => faq.question)).size, 3, `${context}: local questions are distinct`)
    for (const check of copy.checks) assert.ok(check.title.trim() && check.body.trim(), `${context}: complete buyer check`)
    for (const area of copy.areas) {
      assert.ok(area.name.trim() && area.description.trim(), `${context}: complete location comparison`)
      assertListingLink(area.href, `${context}/${area.name}`)
    }
    for (const faq of copy.faqs) assert.ok(faq.question.trim() && faq.answer.trim(), `${context}: complete local answer`)
    const sources = [...copy.checks, ...copy.faqs].flatMap(item => item.source ? [item.source] : [])
    assert.ok(sources.length > 0, `${context}: local guidance links to its sources`)
    for (const source of sources) assertSource(source, context)
  }

  const related = relatedBuyerLocations(location)
  assert.ok(related.length <= 4)
  assert.equal(new Set(related.map(other => other.slug)).size, related.length)
  for (const other of related) {
    assert.notEqual(other.slug, location.slug, "related guides do not link to themselves")
    assert.equal(other.searchRegion, location.searchRegion, "related guides belong to the same search region")
    assert.equal(getBuyerLocation(other.slug), other)
  }

  for (const market of marketKeys) {
    const expected = expectedMarkets[market]
    const context = `${market}/${location.slug}`
    const route = `${expected.path}/${location.slug}`
    const metadata = buyerLocationMetadata(location, market)
    assert.equal(metadata.alternates?.canonical, route, `${context}: canonical keeps both market and place`)
    assert.equal(metadata.openGraph?.url, route, `${context}: social URL matches the canonical route`)
    assert.equal(metadata.openGraph?.locale, expected.locale, `${context}: social locale matches the page language`)
    assert.ok(metadata.title && typeof metadata.title === "object" && "absolute" in metadata.title)
    assert.ok(metadata.title.absolute.includes(location.name), `${context}: title names the actual location`)
    assert.match(metadata.title.absolute, expected.title, `${context}: title uses the intended language and buyer market`)
    assert.ok(metadata.description)
    assert.ok(metadata.description.includes(location.name))
    assert.match(metadata.description, expected.origin, `${context}: description uses the intended buyer market`)

    const languages = metadata.alternates?.languages
    assert.ok(languages, `${context}: hreflang alternatives exist`)
    assert.deepEqual(Object.keys(languages).sort(), ["de-DE", "en-CA", "en-GB"], `${context}: all three language regions are present`)
    for (const targetMarket of marketKeys) {
      const target = expectedMarkets[targetMarket]
      const targetUrl = `${SITE_URL}${target.path}/${location.slug}`
      assert.equal(languages[target.language], targetUrl, `${context}: ${target.language} points to the same place`)
      const reciprocal = buyerLocationMetadata(location, targetMarket)
      assert.equal(reciprocal.alternates?.canonical, `${target.path}/${location.slug}`)
      assert.equal(reciprocal.alternates?.languages?.[expected.language], SITE_URL + route, `${context}: ${target.language} links back to this page`)
    }
    assert.equal(languages[expected.language], SITE_URL + route, `${context}: self hreflang agrees with the canonical`)
    assert.deepEqual(languages, buyerFunnelLanguages(location.slug))

    const faqs = buyerLocationFaqs(location, market)
    const localFaqs = market === "germany" ? location.de.faqs : location.en.faqs
    assert.deepEqual(faqs.slice(0, 3), localFaqs, `${context}: the correct language's local questions are retained`)
    assert.equal(faqs.length, market === "germany" ? 7 : 6, `${context}: market questions supplement the three local FAQs`)
    assert.equal(new Set(faqs.map(faq => faq.question)).size, faqs.length, `${context}: local and market questions do not collide`)
    for (const faq of faqs) {
      assert.ok(faq.question.trim() && faq.answer.trim(), `${context}: complete rendered FAQ`)
      if (faq.source) assertSource(faq.source, context)
    }
  }
}

console.log("International buyer locations verified: 12 places, 36 canonical routes, reciprocal language links and local buyer content")
