import assert from "node:assert/strict"
import { classifySeoPage, pathnameFromUrl } from "../analytics/page-classification"

assert.equal(classifySeoPage("/properties/123-coast-ave/abc"), "property")
assert.equal(classifySeoPage("/buy/san-diego/carlsbad-ca"), "city")
assert.equal(classifySeoPage("/buy/san-diego"), "county")
assert.equal(classifySeoPage("/california/carlsbad/condos-for-sale"), "facet")
assert.equal(classifySeoPage("/properties?city=Carlsbad"), "search")
assert.equal(classifySeoPage("/international-buyers/uk"), "international_buyers")
assert.equal(classifySeoPage("/international-buyers/uk/san-diego"), "international_buyers")
assert.equal(classifySeoPage("/international-buyers/germany"), "international_buyers")
assert.equal(classifySeoPage("/international-buyers/canada/san-diego"), "international_buyers")
assert.equal(classifySeoPage("https://crowncoastalhomes.com/international-buyers/uk/?utm_source=google"), "international_buyers")
assert.equal(classifySeoPage("/international-buyers/uk/san-diego/#contact"), "international_buyers")
assert.equal(classifySeoPage("/international-buyers-guide"), "other")
assert.equal(classifySeoPage("/buyers-guide"), "guide")
assert.equal(pathnameFromUrl("https://crowncoastalhomes.com/contact?utm_source=test"), "/contact")

console.log("page classification tests passed")
