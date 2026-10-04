import assert from "node:assert/strict"

import {
  buildLeadAnalyticsParameters,
  trackLeadConversion,
  trackLeadEvent,
} from "@/lib/analytics/conversion"

const propertyEvent = buildLeadAnalyticsParameters(
  "/properties/5725-soledad-mountain-la-jolla-ca/f82ab4126ce5b4c55b7953cd0dd713a3",
  {
    source: "property-contact-panel",
    kind: "tour",
    hasPropertyContext: true,
    listingKey: "1173111094",
  },
)

assert.deepEqual(propertyEvent, {
  page_type: "property",
  lead_source: "property-contact-panel",
  lead_kind: "tour",
  property_context: true,
  listing_id: "1173111094",
})

const errorEvent = buildLeadAnalyticsParameters("/contact", {
  source: "contact-page",
  kind: "contact",
  errorCode: "request_failed",
})

assert.deepEqual(errorEvent, {
  page_type: "contact",
  lead_source: "contact-page",
  lead_kind: "contact",
  property_context: false,
  error_code: "request_failed",
})

for (const forbiddenKey of ["name", "email", "phone", "property_address"]) {
  assert.equal(
    Object.prototype.hasOwnProperty.call(propertyEvent, forbiddenKey),
    false,
    `Analytics payload must not contain ${forbiddenKey}`,
  )
}

const browserGlobal = globalThis as typeof globalThis & {
  window: Window
}
browserGlobal.window = {
  location: { pathname: "/contact" },
  dataLayer: [],
} as unknown as Window

trackLeadEvent("lead_form_start", {
  source: "contact-page",
  kind: "contact",
})
assert.deepEqual(Array.from(browserGlobal.window.dataLayer![0] as IArguments), ["event", "lead_form_start", {
  page_type: "contact",
  lead_source: "contact-page",
  lead_kind: "contact",
  property_context: false,
}])

const gtagCalls: unknown[][] = []
browserGlobal.window.gtag = (...args: unknown[]) => gtagCalls.push(args)
trackLeadEvent("lead_form_step", {
  source: "canada_orange_county_consult",
  kind: "contact",
  formStep: "contact",
})
assert.deepEqual(gtagCalls.map(call => call.slice(0, 2)), [["event", "lead_form_step"]], "Moving to contact details is not a conversion")
assert.equal((gtagCalls[0][2] as Record<string, unknown>).form_step, "contact")
gtagCalls.length = 0
trackLeadConversion({
  source: "property-contact-panel",
  kind: "tour",
  hasPropertyContext: true,
  listingKey: "1173111094",
})

assert.deepEqual(
  gtagCalls.map((call) => call.slice(0, 2)),
  [
    ["event", "lead_success"],
    ["event", "generate_lead"],
  ],
)

delete (globalThis as { window?: Window }).window

console.log("conversionAnalytics.test.ts passed")
