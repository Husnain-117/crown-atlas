import assert from "node:assert/strict"

import type { LandingPageContent } from "../../ai/landing"
import { validateLandingContentForPublication } from "../landing/content-policy"
import { sanitizeContentHtml } from "../sanitize-content-html"

const content = {
  seo: {
    title: "San Diego Homes",
    meta_description: "Current listings",
    h1: "Homes in San Diego",
    canonical_path: "/california/san-diego/homes-for-sale",
    og_title: "San Diego Homes",
    og_description: "Current listings",
  },
  intro: { subheadline: "Current CRMLS listings", quick_bullets: [], last_updated_line: "July 2026" },
  sections: {
    hero_overview: { heading: "Overview", body: "Review current listings." },
    about_area: { heading: "Area", body: "Verify location details." },
    neighborhoods: { heading: "Locations", body: "Compare locations.", cards: [] },
    buyer_strategy: { heading: "Plan", body: "Complete due diligence.", cta: { title: "Contact", body: "Ask a question.", button_text: "Contact", button_href: "/contact" } },
    property_types: { heading: "Types", body: "Compare ownership types." },
    market_snapshot: { heading: "Market", body: "A current snapshot." },
    buy_vs_rent: { heading: "Buy or rent", body: "Compare scenarios." },
    price_breakdown: { heading: "Price", body: "Review current prices." },
    schools_education: { heading: "Schools", body: "Use official district sources." },
    lifestyle_amenities: { heading: "Location", body: "Verify travel times." },
    featured_listings: { heading: "Listings", body: "Current listings." },
    working_with_agent: { heading: "Guidance", body: "Licensed real estate guidance." },
  },
  faq: [],
  internal_linking: { in_body_links: [], related_pages: [], more_in_city: [], nearby_cities: [] },
  trust: { about_brand: "Licensed guidance.", agent_box: { headline: "Agent", body: "Transaction guidance.", disclaimer: "Verify details." } },
} as LandingPageContent

assert.deepEqual(validateLandingContentForPublication(content, content.seo.canonical_path), { ok: true })

const unsafe = structuredClone(content)
unsafe.sections.about_area.body = "A family-friendly area with top-rated schools."
const result = validateLandingContentForPublication(unsafe, unsafe.seo.canonical_path)
assert.equal(result.ok, false)

const generic = structuredClone(content)
generic.sections.hero_overview.body = "Welcome to beautiful San Diego, nestled in the heart of the coast."
assert.equal(validateLandingContentForPublication(generic, generic.seo.canonical_path).ok, false)

for (const label of ["Not Applicable", "Not Listed", "NOT_APPLICABLE", "Not&nbsp;Listed"]) {
  const placeholder = structuredClone(content)
  placeholder.sections.neighborhoods.body = `${label} is a popular neighborhood with homes near the beach.`
  assert.equal(validateLandingContentForPublication(placeholder, placeholder.seo.canonical_path).ok, false)
}
for (const name of ["N/A", "Unknown", "None", "See Remarks"]) {
  const placeholder = structuredClone(content)
  placeholder.sections.neighborhoods.cards = [{ name, blurb: "Area guide" }]
  assert.equal(validateLandingContentForPublication(placeholder, placeholder.seo.canonical_path).ok, false)
}

const sanitized = sanitizeContentHtml('<p>Safe text</p><script>alert(1)</script><a href="javascript:alert(1)">Bad link</a>')
assert.equal(sanitized.includes("script"), false)
assert.equal(sanitized.includes("javascript:"), false)

console.log("landingContentPolicy: all assertions passed")
