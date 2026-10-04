import assert from "node:assert/strict"
import { normalizePropertyCoordinates } from "../property-coordinates"

assert.deepEqual(
  normalizePropertyCoordinates({ lat: "33.6846", lng: "-117.8265" }),
  { lat: 33.6846, lng: -117.8265 },
)

assert.deepEqual(
  normalizePropertyCoordinates({ lat: 33.6846, lng: -117.8265 }),
  { lat: 33.6846, lng: -117.8265 },
)

assert.equal(normalizePropertyCoordinates({ lat: "", lng: "-117.8265" }), null)
assert.equal(normalizePropertyCoordinates({ lat: "not-a-number", lng: -117.8265 }), null)
assert.equal(normalizePropertyCoordinates({ lat: 91, lng: -117.8265 }), null)
assert.equal(normalizePropertyCoordinates({ lat: 0, lng: 0 }), null)

console.log("propertyCoordinates: all assertions passed")
