import assert from "node:assert/strict"
import { NextRequest } from "next/server"
import { POST } from "../../app/api/contact-info/route"
import { contactInquirySchema } from "../contact-inquiry"
import { ADMIN_EMAILS } from "../email"
import {
  UK_BUYER_ORIGIN,
  buildUkBuyerInquiryPayload,
  confirmedUkBuyerDelivery,
  resolveUkBuyerRegion,
  ukBuyerInquirySchema,
} from "../uk-buyer-inquiry"

async function main() {
  assert.equal(resolveUkBuyerRegion(), "Still comparing")
  assert.equal(resolveUkBuyerRegion("San Diego / La Jolla"), "San Diego / La Jolla")
  assert.equal(resolveUkBuyerRegion("Not a region"), "Still comparing")

  const minimal = ukBuyerInquirySchema.parse({ name: "Jane Example", email: "jane@example.test", searchRegion: "Still comparing" })
  assert.equal(minimal.timeZone, "Europe/London")
  assert.equal(minimal.contactPreference, "Email")
  const minimalPayload = buildUkBuyerInquiryPayload(minimal, {
    source: "uk-buyer-main",
    pageUrl: "https://crowncoastalhomes.com/international-buyers/uk?email=private@example.test#enquire",
    elapsedMs: 1000,
  })
  assert.equal(minimalPayload.pageUrl, "https://crowncoastalhomes.com/international-buyers/uk")
  assert.equal(minimalPayload.buyerOrigin, UK_BUYER_ORIGIN)
  assert.match(minimalPayload.message, /Buying from England \/ UK/)
  assert.match(minimalPayload.message, /Still comparing/)
  assert.equal(minimalPayload.budgetRange, undefined)
  assert.equal(contactInquirySchema.safeParse(minimalPayload).success, true)

  for (const invalid of [
    { ...minimal, name: " " },
    { ...minimal, email: "bad" },
    { ...minimal, searchRegion: "Unknown place" },
    { ...minimal, budgetRange: "<script>500</script>" },
    { ...minimal, contactPreference: "Telegram" },
    { ...minimal, phone: "abcdefghi" },
    { ...minimal, phone: "+1234567890123456" },
    { ...minimal, timeZone: "Invented/Zone" },
    { ...minimal, message: "a".repeat(4001) },
  ]) assert.equal(ukBuyerInquirySchema.safeParse(invalid).success, false)

  const full = ukBuyerInquirySchema.parse({
    name: " Jane Example ", email: " jane@example.test ", searchRegion: "San Diego / La Jolla",
    purchaseTimeline: "3–6 months", budgetRange: "$1–2 million", phone: "+44 20 7946 0958",
    contactPreference: "Video call", timeZone: "Europe/London", message: "A second home; please email first. <budget check>",
  })
  const payload = buildUkBuyerInquiryPayload(full, {
    source: "uk-buyer-san-diego", pageUrl: "https://crowncoastalhomes.com/international-buyers/uk/san-diego",
    elapsedMs: 1200, company: "",
  })
  assert.equal(full.name, "Jane Example")
  assert.equal(payload.phone, "+44 20 7946 0958")
  assert.equal(payload.contactPreference, "Video call")
  assert.equal(payload.__top, 1200)
  assert.equal(contactInquirySchema.safeParse(payload).success, true)
  assert.equal(contactInquirySchema.safeParse({ ...payload, budgetRange: "invalid" }).success, false)
  assert.equal(contactInquirySchema.safeParse({ ...payload, buyerOrigin: "somewhere else" }).success, false)

  for (const body of [null, {}, { success: true }, { success: true, requestId: "" }, { success: true, requestId: 7 }, { success: false, requestId: "request" }]) {
    assert.equal(confirmedUkBuyerDelivery(true, body), false)
  }
  assert.equal(confirmedUkBuyerDelivery(false, { success: true, requestId: "request" }), false)
  assert.equal(confirmedUkBuyerDelivery(true, { success: true, requestId: "request" }), true)

  const originalFetch = globalThis.fetch
  const originalApiKey = process.env.RESEND_API_KEY
  const messages: Array<Record<string, unknown>> = []
  let rejectDelivery = false
  process.env.RESEND_API_KEY = "re_test_uk_buyer_delivery"
  globalThis.fetch = async (input, init) => {
    assert.equal(String(input), "https://api.resend.com/emails", "test must never send a real request")
    messages.push(JSON.parse(String(init?.body)))
    return new Response(JSON.stringify(rejectDelivery ? { message: "Test provider rejection", name: "validation_error" } : { id: `test-email-${messages.length}` }), {
      status: rejectDelivery ? 400 : 200,
      headers: { "Content-Type": "application/json" },
    })
  }
  const request = (body: Record<string, unknown>) => new NextRequest("https://crowncoastalhomes.com/api/contact-info", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  })

  try {
    const delivered = await POST(request(payload))
    assert.equal(delivered.status, 200)
    assert.equal(confirmedUkBuyerDelivery(delivered.ok, await delivered.json()), true)
    assert.equal(messages.length, 2, "owner notification and visitor confirmation")
    const owner = messages[0]
    assert.deepEqual(owner.to, ADMIN_EMAILS)
    assert.equal(owner.reply_to, "jane@example.test")
    assert.match(String(owner.subject), /Buying from England \/ UK/)
    const html = String(owner.html)
    for (const detail of ["San Diego / La Jolla", "3–6 months", "$1–2 million", "Video call", "Europe/London", "+44 20 7946 0958", "uk-buyer-san-diego"]) assert.ok(html.includes(detail), detail)
    assert.ok(html.includes("&lt;budget check&gt;"), "free text must be HTML-escaped")
    assert.match(String(messages[1].html), /buying a California home from England \/ the UK/)

    messages.length = 0
    const spam = await POST(request({ ...payload, company: "filled honeypot" }))
    assert.equal(spam.status, 202)
    assert.equal(confirmedUkBuyerDelivery(spam.ok, await spam.json()), false)
    assert.equal(messages.length, 0)

    const invalid = await POST(request({ ...payload, contactPreference: "Invalid" }))
    assert.equal(invalid.status, 400)
    assert.equal(messages.length, 0)

    rejectDelivery = true
    const failed = await POST(request(payload))
    assert.equal(failed.status, 502)
    assert.equal(confirmedUkBuyerDelivery(failed.ok, await failed.json()), false)
    assert.equal(messages.length, 1, "no visitor confirmation after rejected owner delivery")
  } finally {
    globalThis.fetch = originalFetch
    if (originalApiKey === undefined) delete process.env.RESEND_API_KEY
    else process.env.RESEND_API_KEY = originalApiKey
  }
  console.log("ukBuyerInquiry: all assertions passed; all email transport mocked")
}

main().catch(error => { console.error(error); process.exitCode = 1 })
