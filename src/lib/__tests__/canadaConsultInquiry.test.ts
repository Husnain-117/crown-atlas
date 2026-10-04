import assert from "node:assert/strict"
import { NextRequest } from "next/server"
import { POST } from "../../app/api/contact-info/route"
import { canadaConsultSchema, canadaConsultSchemaForRegion, buildCanadaConsultPayload, readCampaignAttribution } from "../canada-consult-inquiry"
import { CANADA_CONSULT_REGIONS, type CanadaConsultRegion } from "../canada-consult-regions"
import { contactInquirySchema } from "../contact-inquiry"
import { confirmedUkBuyerDelivery } from "../uk-buyer-inquiry"
import { ADMIN_EMAILS } from "../email"

async function main() {
  const values = canadaConsultSchema.parse({ name: "Alex Example", email: "alex@example.test", targetLocation: "Del Mar", purchaseTimeline: "3–6 months", budgetRange: "Prefer to discuss", propertyPurpose: "Second home", consent: true })
  const pageUrl = "https://crowncoastalhomes.com/international-buyers/canada/san-diego-consult?utm_source=google&utm_campaign=canada-sd&utm_content=%3Cscript%3E&ad_group=coastal&gclid=click123&email=private%40example.test#enquire"
  const attribution = readCampaignAttribution(pageUrl)
  assert.deepEqual(attribution, { utm_source: "google", utm_campaign: "canada-sd", utm_content: "<script>", ad_group: "coastal", gclid: "click123" })
  assert.deepEqual(readCampaignAttribution("invalid"), {})
  assert.equal(readCampaignAttribution(`https://example.test/?utm_campaign=${"x".repeat(201)}`).utm_campaign?.length, 200)
  const payload = buildCanadaConsultPayload(values, { pageUrl, attribution, elapsedMs: 1500, company: "" })
  assert.equal(payload.pageUrl.includes("?"), false, "unapproved query parameters must not reach the inbox")
  assert.equal(payload.propertyPurpose, "Second home")
  assert.equal(contactInquirySchema.safeParse(payload).success, true)
  assert.equal(contactInquirySchema.safeParse(buildCanadaConsultPayload({ ...values, message: "x".repeat(1000) }, { pageUrl, attribution, elapsedMs: 1500, company: "" })).success, true, "a maximum-length optional message remains deliverable")
  for (const invalid of [{ consent: false }, { budgetRange: "" }, { targetLocation: "Los Angeles" }, { purchaseTimeline: "" }, { propertyPurpose: "" }, { buyerOrigin: "Germany" }]) {
    assert.equal(contactInquirySchema.safeParse({ ...payload, ...invalid }).success, false, JSON.stringify(invalid))
  }
  const originalFetch = globalThis.fetch
  const originalKey = process.env.RESEND_API_KEY
  const messages: Array<Record<string, unknown>> = []
  let fail = false
  process.env.RESEND_API_KEY = "re_test_canada_consult"
  globalThis.fetch = async (input, init) => {
    assert.equal(String(input), "https://api.resend.com/emails", "all email delivery must be mocked")
    messages.push(JSON.parse(String(init?.body)))
    return new Response(JSON.stringify(fail ? { message: "Test failure" } : { id: "test-consult" }), { status: fail ? 400 : 200 })
  }
  const request = (body: unknown) => new NextRequest("https://crowncoastalhomes.com/api/contact-info", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
  try {
    const response = await POST(request(payload))
    assert.equal(confirmedUkBuyerDelivery(response.ok, await response.json()), true)
    assert.deepEqual(messages[0].to, ADMIN_EMAILS)
    assert.equal(messages.length, 2)
    assert.match(String(messages[1].html), /meeting time is confirmed separately/)
    const html = String(messages[0].html)
    for (const text of ["Second home", "Del Mar", "Prefer to discuss", "canada-sd", "coastal", "click123", "Contact consent"]) assert.ok(html.includes(text), text)
    assert.ok(html.includes("&lt;script&gt;"))
    assert.ok(!html.includes("<script>"))
    assert.ok(!html.includes("private@example.test"))
    for (const region of Object.keys(CANADA_CONSULT_REGIONS) as CanadaConsultRegion[]) {
      const config = CANADA_CONSULT_REGIONS[region]
      const regionalValues = canadaConsultSchemaForRegion(region).parse({ ...values, targetLocation: config.areas[0], propertyPurpose: `Moving to ${config.label}` })
      const regionalPayload = buildCanadaConsultPayload(regionalValues, { pageUrl: `https://crowncoastalhomes.com/international-buyers/canada/${region}-consult`, attribution, elapsedMs: 1500, company: "" }, region)
      assert.equal(regionalPayload.source, config.source)
      assert.equal(regionalPayload.searchRegion, config.searchRegion)
      assert.equal(contactInquirySchema.safeParse(regionalPayload).success, true)
      assert.equal(contactInquirySchema.safeParse({ ...regionalPayload, targetLocation: region === "san-diego" ? "Newport Beach" : "Del Mar" }).success, false, "areas cannot leak between regional funnels")
      assert.equal(contactInquirySchema.safeParse({ ...regionalPayload, searchRegion: "wrong region" }).success, false)
      assert.equal(contactInquirySchema.safeParse({ ...regionalPayload, consent: false }).success, false)
      messages.length = 0
      const delivered = await POST(request(regionalPayload))
      assert.equal(confirmedUkBuyerDelivery(delivered.ok, await delivered.json()), true)
      assert.deepEqual(messages[0].to, ADMIN_EMAILS)
      assert.ok(String(messages[0].html).includes(config.source))
      assert.ok(String(messages[0].html).includes(config.label))
      assert.ok(String(messages[0].html).includes(config.areas[0]))
      assert.ok(String(messages[1].html).includes(`20-minute ${config.label} home-buying consultation`))
      assert.ok(!String(messages[1].html).includes("20-minute San Diego") || region === "san-diego")
    }
    messages.length = 0
    const invalidResponse = await POST(request({ ...payload, consent: false }))
    assert.equal(invalidResponse.status, 400)
    assert.equal(messages.length, 0)
    fail = true
    const failure = await POST(request(payload))
    assert.equal(failure.status, 502)
    assert.equal(confirmedUkBuyerDelivery(failure.ok, await failure.json()), false)
  } finally {
    globalThis.fetch = originalFetch
    if (originalKey === undefined) delete process.env.RESEND_API_KEY
    else process.env.RESEND_API_KEY = originalKey
  }
  console.log("canadaConsultInquiry: all assertions passed; email delivery mocked")
}
main().catch(error => { console.error(error); process.exitCode = 1 })
