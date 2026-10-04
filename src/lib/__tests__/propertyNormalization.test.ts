import assert from "node:assert/strict"
import {
  buildPropertyMediaUrls,
  toNullableBoolean,
  toNullableNumber,
} from "@/lib/property-normalization"

assert.equal(toNullableNumber("1,000"), null)
assert.equal(toNullableNumber("1250.5"), 1250.5)
assert.equal(toNullableNumber(""), null)
assert.equal(toNullableBoolean("yes"), true)
assert.equal(toNullableBoolean("0"), false)
assert.equal(toNullableBoolean("unknown"), null)

assert.deepEqual(buildPropertyMediaUrls({
  listingKey: "ABC 123",
  mainPhotoUrl: "/placeholder.svg",
  photosCount: 3,
}), [])

assert.deepEqual(buildPropertyMediaUrls({
  listingKey: "ABC123",
  mainPhotoUrl: "https://images.example.test/main.jpg",
  mediaUrls: [
    "https://images.example.test/main.jpg",
    "https://images.example.test/second.jpg",
  ],
  photosCount: 20,
}), [
  "https://images.example.test/main.jpg",
  "https://images.example.test/second.jpg",
])

console.log("propertyNormalization.test.ts: all assertions passed")
