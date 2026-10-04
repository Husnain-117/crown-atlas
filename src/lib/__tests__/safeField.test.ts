import assert from "node:assert/strict"
import { safeNumber, safeSqft } from "@/lib/utils/safeField"

assert.equal(safeNumber(0), null)
assert.equal(safeNumber("0"), null)
assert.equal(safeNumber("1443"), 1443)
assert.equal(safeSqft(1443), "1,443 sqft")

console.log("safeField.test.ts: all assertions passed")
