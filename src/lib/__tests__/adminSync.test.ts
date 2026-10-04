import assert from "node:assert/strict"
import { resolveSyncWindowMinutes } from "../admin-sync"

assert.equal(resolveSyncWindowMinutes("recent", undefined), 60)
assert.equal(resolveSyncWindowMinutes("all", undefined), 1440)
assert.equal(resolveSyncWindowMinutes("full", undefined), 1440)
assert.equal(resolveSyncWindowMinutes("recent", 15.4), 15)
assert.equal(resolveSyncWindowMinutes("recent", -20), 1)
assert.equal(resolveSyncWindowMinutes("recent", 99999), 1440)

console.log("adminSync: all assertions passed")
