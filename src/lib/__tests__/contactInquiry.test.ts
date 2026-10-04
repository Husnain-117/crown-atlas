import assert from "node:assert/strict"
import { NextRequest } from "next/server"

import { POST as postPropertyInquiry } from "../../app/api/contact/route"
import { POST as postContactInquiry } from "../../app/api/contact-info/route"
import { GET as getSubscribers } from "../../app/api/subscribers/route"
import {
  contactInquirySchema,
  escapeContactHtml,
  isContactSpamProbe,
  singleLineContactText,
} from "../contact-inquiry"
import { ADMIN_EMAILS, LEAD_NOTIFICATION_EMAIL } from "../email"
import {
  buildInquirySubject,
  buildPropertyContextHtml,
  propertyInquirySummary,
  safeHttpUrl,
} from "../inquiry-notification"
import {
  buildTourAdminEmailHtml,
  buildTourAdminSubject,
  tourBookingSchema,
} from "../tour-booking"

async function main() {
  assert.equal(
    escapeContactHtml('<img src=x onerror="alert(1)"> & test'),
    "&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; test",
  )
  assert.equal(singleLineContactText("Jane\r\nBcc: attacker@example.com"), "Jane Bcc: attacker@example.com")
  assert.equal(isContactSpamProbe({ company: "spam" }), true)
  assert.equal(isContactSpamProbe({ __top: 749 }), true)
  assert.equal(isContactSpamProbe({ __top: 750 }), false)
  assert.deepEqual(ADMIN_EMAILS, [
    "contact@crowncoastalhomes.com", "reza@crowncoastalhomes.com", "djelveh.m@googlemail.com",
  ])
  assert.equal(LEAD_NOTIFICATION_EMAIL, "contact@crowncoastalhomes.com")

  const propertyContext = {
    propertyAddress: "12647 Trent Jones Lane, Tustin, CA 92782",
    listingKey: "1170715833",
    pageUrl: "https://crowncoastalhomes.com/properties/12647-trent-jones-lane/1170715833",
  }
  assert.equal(
    propertyInquirySummary(propertyContext),
    "12647 Trent Jones Lane, Tustin, CA 92782 (Listing ID: 1170715833)",
  )
  assert.equal(
    buildInquirySubject({ kind: "Property inquiry", name: "Jane\r\nSmith", context: propertyContext }),
    "Property inquiry: 12647 Trent Jones Lane, Tustin, CA 92782 (Listing ID: 1170715833) - Jane Smith",
  )
  const propertyHtml = buildPropertyContextHtml(propertyContext)
  assert.match(propertyHtml, /12647 Trent Jones Lane/)
  assert.match(propertyHtml, /1170715833/)
  assert.match(propertyHtml, /<a href="https:\/\/crowncoastalhomes\.com\//)
  assert.equal(safeHttpUrl("javascript:alert(1)"), "")

  assert.equal(contactInquirySchema.safeParse({
    name: "Jane Smith",
    email: "jane@example.com",
    message: "Hello",
  }).success, true)
  assert.equal(contactInquirySchema.safeParse({
    name: "Jane Smith",
    email: "not-an-email",
    message: "Hello",
  }).success, false)

  const tour = tourBookingSchema.parse({
    tourType: "in-person",
    date: "2026-07-20",
    time: "11:00 AM",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 858 555 0100",
    propertyAddress: propertyContext.propertyAddress,
    propertyKey: propertyContext.listingKey,
    pageUrl: propertyContext.pageUrl,
  })
  assert.match(buildTourAdminSubject(tour), /12647 Trent Jones Lane/)
  assert.match(buildTourAdminSubject(tour), /1170715833/)
  assert.match(buildTourAdminEmailHtml(tour), /Property Context/)

  const invalidResponse = await postContactInquiry(requestWith("/api/contact-info", { email: "bad" }))
  assert.equal(invalidResponse.status, 400)

  const botResponse = await postContactInquiry(requestWith("/api/contact-info", { company: "spam" }))
  assert.equal(botResponse.status, 202)
  assert.equal((await botResponse.json()).success, true)

  const propertyBotResponse = await postPropertyInquiry(requestWith("/api/contact", { company: "spam" }))
  assert.equal(propertyBotResponse.status, 202)

  await assertPropertyInquiryDelivery(propertyContext)

  const unauthorizedSubscriberRead = await getSubscribers(
    new NextRequest("https://crowncoastalhomes.com/api/subscribers"),
  )
  assert.equal(unauthorizedSubscriberRead.status, 401)

  console.log("contactInquiry: all assertions passed")
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

async function assertPropertyInquiryDelivery(propertyContext: {
  propertyAddress: string
  listingKey: string
  pageUrl: string
}) {
  const requestedDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  const originalFetch = globalThis.fetch
  const originalApiKey = process.env.RESEND_API_KEY
  const deliveries: Array<Record<string, unknown>> = []

  process.env.RESEND_API_KEY = "re_test_property_delivery"
  globalThis.fetch = async (input, init) => {
    assert.equal(String(input), "https://api.resend.com/emails")
    deliveries.push(JSON.parse(String(init?.body)) as Record<string, unknown>)
    return new Response(JSON.stringify({ id: `email_${deliveries.length}` }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const response = await postPropertyInquiry(requestWith("/api/contact", {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 858 555 0100",
      message: "Please send the property details.",
      mode: "agent",
      propertyData: {
        address: propertyContext.propertyAddress,
        listing_key: propertyContext.listingKey,
      },
      pageUrl: propertyContext.pageUrl,
      __top: 1000,
    }))

    assert.equal(response.status, 200)
    assert.equal((await response.json()).success, true)
    assert.equal(deliveries.length, 2)

    const ownerNotification = deliveries[0]
    assert.deepEqual(ownerNotification.to, ADMIN_EMAILS)
    assert.equal(ownerNotification.reply_to, "jane@example.com")
    assert.equal(ownerNotification.from, "Crown Coastal Homes <contact@crowncoastalhomes.com>")
    assert.deepEqual(deliveries[1].to, ["jane@example.com"])
    assert.equal(deliveries[1].reply_to, "contact@crowncoastalhomes.com")
    assert.match(String(ownerNotification.subject), /12647 Trent Jones Lane/)
    assert.match(String(ownerNotification.subject), /1170715833/)
    assert.match(String(ownerNotification.html), /12647 Trent Jones Lane/)
    assert.match(String(ownerNotification.html), /1170715833/)
    assert.match(String(ownerNotification.html), /crowncoastalhomes\.com\/properties/)

    deliveries.length = 0
    const tourResponse = await postPropertyInquiry(requestWith("/api/contact", {
      name: "Jane Smith", email: "jane@example.com", phone: "+44 20 7946 0958",
      mode: "tour", tourType: "virtual", preferredDate: requestedDate,
      preferredTime: "18:30", timeZone: "Europe/London",
      propertyData: { address: propertyContext.propertyAddress, listing_key: propertyContext.listingKey },
      pageUrl: propertyContext.pageUrl, __top: 1000,
    }))
    assert.equal(tourResponse.status, 200)
    assert.ok((await tourResponse.json()).requestId)
    assert.deepEqual(deliveries[0].to, ADMIN_EMAILS)
    assert.equal(deliveries.length, 2)
    for (const delivery of deliveries) {
      assert.match(String(delivery.html), /[Ll]ive video tour/)
      assert.ok(String(delivery.html).includes(requestedDate))
      assert.match(String(delivery.html), /18:30/)
      assert.match(String(delivery.html), /Europe\/London/)
      assert.match(String(delivery.html), /1170715833/)
    }

    const invalidZone = await postPropertyInquiry(requestWith("/api/contact", {
      name: "Jane Smith", email: "jane@example.com", mode: "tour", preferredDate: requestedDate,
      timeZone: "Not/AZone", __top: 1000,
    }))
    assert.equal(invalidZone.status, 400)
    assert.equal(deliveries.length, 2, "invalid preferences must not send mail")

    deliveries.length = 0
    const contactResponse = await postContactInquiry(requestWith("/api/contact-info", {
      name: "Jane Smith", email: "jane@example.com", phone: "+44 20 7946 0958",
      message: "Please discuss my property search.", listingKey: propertyContext.listingKey,
      propertyAddress: propertyContext.propertyAddress, propertyPageUrl: propertyContext.pageUrl,
      searchRegion: "San Diego & La Jolla", purchaseTimeline: "3–6 months", timeZone: "UK / London",
      __top: 1000,
    }))
    assert.equal(contactResponse.status, 200)
    assert.ok((await contactResponse.json()).requestId)
    assert.deepEqual(deliveries[0].to, ADMIN_EMAILS)
    assert.equal(deliveries.length, 2)
    assert.match(String(deliveries[0].html), /San Diego &amp; La Jolla/)
    assert.match(String(deliveries[0].html), /3–6 months/)
    assert.match(String(deliveries[0].html), /UK \/ London/)
    assert.match(String(deliveries[0].html), /1170715833/)
    assert.match(String(deliveries[0].html), /\+44 20 7946 0958/)

    // A rejected provider delivery must not be reported as a conversion.
    globalThis.fetch = async () => new Response(JSON.stringify({ message: "Unavailable" }), { status: 503 })
    const failed = await postContactInquiry(requestWith("/api/contact-info", {
      name: "Jane Smith", email: "jane@example.com", message: "Please discuss my property search.", __top: 1000,
    }))
    assert.equal(failed.status, 502)
    const failedBody = await failed.json()
    assert.equal(failedBody.success, false)
    assert.equal(failedBody.requestId, undefined)
  } finally {
    globalThis.fetch = originalFetch
    if (originalApiKey === undefined) delete process.env.RESEND_API_KEY
    else process.env.RESEND_API_KEY = originalApiKey
  }
}
