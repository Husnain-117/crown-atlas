import assert from "node:assert/strict"
import type { PropertyFilters } from "@/types/filters"
import { generateQueryParams, parseURLToFilters } from "@/utils/url-filters"

const filters: PropertyFilters = {
  priceRange: [750_000, 1_500_000],
  minLotSize: 2_500,
  maxLotSize: 12_000,
  minYearBuilt: 1990,
  maxYearBuilt: 2024,
  maxHoaFee: 650,
  hasGarage: true,
  hasPool: true,
  hasView: true,
  isWaterfront: true,
  priceReduced: true,
  openHouseDate: "2026-07-25",
}

const serialized = generateQueryParams(filters)
const parsed = parseURLToFilters("/properties", serialized)

assert.deepEqual(parsed.priceRange, filters.priceRange)
assert.equal(parsed.minLotSize, filters.minLotSize)
assert.equal(parsed.maxLotSize, filters.maxLotSize)
assert.equal(parsed.minYearBuilt, filters.minYearBuilt)
assert.equal(parsed.maxYearBuilt, filters.maxYearBuilt)
assert.equal(parsed.maxHoaFee, filters.maxHoaFee)
assert.equal(parsed.hasGarage, true)
assert.equal(parsed.hasPool, true)
assert.equal(parsed.hasView, true)
assert.equal(parsed.isWaterfront, true)
assert.equal(parsed.priceReduced, true)
assert.equal(parsed.openHouseDate, filters.openHouseDate)

const invalid = parseURLToFilters(
  "/properties",
  new URLSearchParams("minPrice=abc&maxHoa=-1&minLot=NaN&minYear=1200&openHouseDate=tomorrow")
)

assert.equal(invalid.priceRange, undefined)
assert.equal(invalid.maxHoaFee, undefined)
assert.equal(invalid.minLotSize, undefined)
assert.equal(invalid.minYearBuilt, undefined)
assert.equal(invalid.openHouseDate, undefined)

console.log("urlFilters: all assertions passed")
