import assert from "node:assert/strict"
import { buildKindFilter } from "@/lib/landing/query"

assert.equal(buildKindFilter("condos-for-sale").searchParams.propertyCategory, "condo")
assert.equal(buildKindFilter("single-family-homes").searchParams.propertyCategory, "house")
assert.equal(buildKindFilter("townhomes-for-sale").searchParams.propertyCategory, "townhouse")
assert.equal(buildKindFilter("new-construction").searchParams.isNewConstruction, true)
assert.equal(buildKindFilter("ocean-view-homes").searchParams.hasOceanView, true)
assert.match(buildKindFilter("homes-with-garage").sql, /garage_spaces/)
assert.doesNotMatch(buildKindFilter("homes-with-garage").sql, /parking_total/)

console.log("landingFilters.test.ts: all assertions passed")
