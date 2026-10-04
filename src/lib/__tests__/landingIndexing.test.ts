import assert from "node:assert/strict"
import { shouldIndexLandingPage } from "../seo/landing-indexing"

assert.equal(shouldIndexLandingPage({ priorityCity: true, priorityLanding: true, activeListings: 8 }), true)
assert.equal(shouldIndexLandingPage({ priorityCity: true, priorityLanding: true, activeListings: 7 }), false)
assert.equal(shouldIndexLandingPage({ priorityCity: false, priorityLanding: true, activeListings: 100 }), false)
assert.equal(shouldIndexLandingPage({ priorityCity: true, priorityLanding: true }), false)

console.log("landing indexing tests passed")
