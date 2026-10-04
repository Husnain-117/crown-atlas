import assert from "node:assert/strict"
import {
  getLegacyPropertyResolverPath,
  getPropertyListingKey,
  getPropertyUrlKey,
  isPropertyEntityKey,
  propertyPathFor,
} from "../property-url"

const property = {
  property_entity_key: "0123456789abcdef0123456789abcdef",
  listing_key: "MLS-123",
  address: "123 Coast Ave #4",
  city: "Carlsbad",
  state: "CA",
  postal_code: "92008",
}

assert.equal(getPropertyListingKey(property), "MLS-123")
assert.equal(getPropertyUrlKey(property), property.property_entity_key)
assert.equal(isPropertyEntityKey(property.property_entity_key), true)
assert.equal(isPropertyEntityKey("MLS-123"), false)
assert.equal(
  getLegacyPropertyResolverPath("/properties/123-coast-ave/MLS-123"),
  "/properties/property/MLS-123"
)
assert.equal(
  getLegacyPropertyResolverPath(`/properties/123-coast-ave/${property.property_entity_key}`),
  null
)
assert.equal(getLegacyPropertyResolverPath("/properties/property/MLS-123"), null)
assert.equal(
  propertyPathFor(property),
  "/properties/123-coast-ave-4-carlsbad-ca-92008/0123456789abcdef0123456789abcdef"
)

console.log("property URL tests passed")
