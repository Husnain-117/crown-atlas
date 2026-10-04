import assert from "node:assert/strict"
import { NextRequest } from "next/server"

import { POST as postLead } from "../../app/api/leads/route"
import { POST as saveSearch } from "../../app/api/save-search/route"
import { isLeadSpamProbe, leadDisplayName, leadInquirySchema } from "../lead-inquiry"
import { savedSearchSchema } from "../saved-search"

async function main() {
  const parsed = leadInquirySchema.parse({
    name: "Jane Smith",
    email: "jane@example.com",
    wantsTour: "on",
    budgetMax: "750000",
  })
  assert.equal(leadDisplayName(parsed), "Jane Smith")
  assert.equal(parsed.wantsTour, true)
  assert.equal(parsed.budgetMax, 750000)
  assert.equal(isLeadSpamProbe({ company: "spam" }), true)
  assert.equal(isLeadSpamProbe({ __top: 749 }), true)
  assert.equal(isLeadSpamProbe({ __top: 750 }), false)

  const propertyLead = leadInquirySchema.parse({
    fullName: "Jane Smith",
    email: "jane@example.com",
    listingKey: "1170715833",
    propertyAddress: "12647 Trent Jones Lane, Tustin, CA 92782",
    pageUrl: "https://crowncoastalhomes.com/properties/12647-trent-jones-lane/1170715833",
  })
  assert.equal(propertyLead.listingKey, "1170715833")
  assert.match(propertyLead.propertyAddress || "", /Trent Jones Lane/)

  const parsedSearch = savedSearchSchema.parse({
    email: "jane@example.com",
    filters: {
      city: "San Diego",
      minPrice: "500000",
      maxPrice: "900000",
      beds: "2",
      baths: "2",
      action: "buy",
    },
  })
  assert.equal(parsedSearch.filters.minPrice, 500000)
  assert.equal(parsedSearch.filters.baths, 2)
  assert.throws(() => savedSearchSchema.parse({
    email: "jane@example.com",
    filters: { minPrice: 900000, maxPrice: 500000 },
  }))

  const invalidLead = await postLead(requestWith("/api/leads", { email: "bad" }))
  assert.equal(invalidLead.status, 400)

  const botLead = await postLead(requestWith("/api/leads", { company: "spam" }))
  assert.equal(botLead.status, 202)
  assert.equal((await botLead.json()).success, true)

  const botSearch = await saveSearch(requestWith("/api/save-search", { company: "spam" }))
  assert.equal(botSearch.status, 202)

  const invalidSearch = await saveSearch(requestWith("/api/save-search", {
    email: "not-an-email",
    filters: {},
  }))
  assert.equal(invalidSearch.status, 400)

  console.log("leadInquiry: all assertions passed")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

function requestWith(path: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(`https://crowncoastalhomes.com${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}
