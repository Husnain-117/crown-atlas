import assert from "node:assert/strict"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { NextRequest } from "next/server"
import BuyerEnquiryForm from "../../components/international-buyers/buyer-enquiry-form"
import { POST } from "../../app/api/contact-info/route"
import { contactInquirySchema } from "../contact-inquiry"
import {
  BUYER_MARKET_CONFIG,
  CANADIAN_BUYER_TIME_ZONES,
  buildBuyerInquiryPayload,
  buildUkBuyerInquiryPayload,
  buyerDeliveryError,
  buyerInquirySchemaForMarket,
  buyerTimeZoneOptions,
  confirmedUkBuyerDelivery,
  type BuyerMarket,
} from "../uk-buyer-inquiry"

async function main() {
  const visitor = { name: "Alex Example", email: "alex@example.test", searchRegion: "Still comparing" }
  const values = (market: BuyerMarket) => buyerInquirySchemaForMarket(market).parse(visitor)
  assert.equal(values("uk").timeZone, "Europe/London")
  assert.equal(values("germany").timeZone, "Europe/Berlin")
  assert.equal(values("canada").timeZone, "America/Toronto")
  for (const market of ["uk", "germany", "canada"] as const) {
    const schema = buyerInquirySchemaForMarket(market)
    assert.equal(values(market).requestedLanguage, market === "germany" ? "German" : "English")
    assert.equal(values(market).targetLocation, undefined, "a preferred city remains optional")
    assert.equal(schema.parse({ ...visitor, targetLocation: "  Los Angeles  " }).targetLocation, "Los Angeles")
    assert.equal(schema.parse({ ...visitor, targetLocation: "x".repeat(160) }).targetLocation?.length, 160)
    assert.equal(schema.parse({ ...visitor, targetLocation: "   " }).targetLocation, "")
    assert.equal(schema.safeParse({ ...visitor, targetLocation: "x".repeat(161) }).success, false)
    for (const requestedLanguage of ["English", "German"] as const) {
      assert.equal(schema.parse({ ...visitor, requestedLanguage }).requestedLanguage, requestedLanguage, "the visitor can override the market default")
    }
    for (const requestedLanguage of ["French", "german", "German<script>alert(1)</script>", ""]) {
      assert.equal(schema.safeParse({ ...visitor, requestedLanguage }).success, false)
    }
  }

  const expectedZones = ["America/Halifax", "America/St_Johns", "America/Toronto", "America/Winnipeg", "America/Regina", "America/Edmonton", "America/Vancouver", "America/Whitehorse"]
  assert.deepEqual(CANADIAN_BUYER_TIME_ZONES.map(zone => zone.value), expectedZones)
  for (const timeZone of expectedZones) {
    assert.equal(buyerInquirySchemaForMarket("canada").parse({ ...visitor, timeZone }).timeZone, timeZone)
  }
  const detectedToronto = buyerTimeZoneOptions("canada", "America/Toronto")
  assert.equal(detectedToronto.filter(zone => zone.value === "America/Toronto").length, 1)
  assert.match(detectedToronto.find(zone => zone.value === "America/Toronto")!.label, /detected on this device/)
  assert.match(buyerTimeZoneOptions("canada", "Europe/Berlin").find(zone => zone.value === "Europe/Berlin")!.label, /detected on this device/)
  assert.match(buyerTimeZoneOptions("germany", "Europe/Berlin")[0].label, /auf diesem Gerät erkannt/)
  assert.equal(buyerTimeZoneOptions("canada", "Invalid/Zone").some(zone => zone.value === "Invalid/Zone"), false)

  for (const [field, value, message] of [
    ["name", "", /vollständigen Namen/], ["email", "invalid", /gültige E-Mail-Adresse/],
    ["searchRegion", "unknown", /wählen Sie eine Region/], ["purchaseTimeline", "tomorrow", /wählen Sie einen Zeitraum/],
    ["budgetRange", "CAD 100", /wählen Sie ein Budget/], ["contactPreference", "text", /E-Mail oder Videogespräch/],
    ["phone", "letters", /Telefonnummer mit Ländervorwahl/], ["timeZone", "Invalid/Zone", /gültige Zeitzone/],
    ["message", "x".repeat(4001), /höchstens 4.000 Zeichen/],
    ["targetLocation", "x".repeat(161), /höchstens 160 Zeichen/],
    ["requestedLanguage", "French", /Deutsch oder Englisch/],
  ] as const) {
    const result = buyerInquirySchemaForMarket("germany").safeParse({ ...visitor, [field]: value })
    assert.equal(result.success, false, field)
    if (!result.success) assert.match(result.error.issues[0].message, message, field)
  }
  assert.match(buyerDeliveryError("germany"), /Zustellung konnte nicht bestätigt/)
  assert.match(buyerDeliveryError("canada"), /could not confirm delivery/)

  const germanHtml = renderToStaticMarkup(createElement(BuyerEnquiryForm, { source: "de-test", market: "germany" }))
  for (const text of ["Vollständiger Name", "E-Mail-Adresse", "Ich vergleiche noch", "In 3–6 Monaten", "1–2 Mio. US-Dollar", "Videogespräch", "Meine Immobiliensuche besprechen", "+49", 'lang="de"']) assert.ok(germanHtml.includes(text), text)
  assert.match(germanHtml, /<option value="Europe\/Berlin" selected="">/)
  assert.match(germanHtml, /<option value="German" selected="">Deutsch<\/option>/)
  for (const text of ["Full name", "Choose a timeline", "Add a few details", "Sending your enquiry"]) assert.ok(!germanHtml.includes(text), text)
  const canadianHtml = renderToStaticMarkup(createElement(BuyerEnquiryForm, { source: "ca-test", market: "canada" }))
  for (const zone of expectedZones) assert.ok(canadianHtml.includes(`value="${zone}"`), zone)
  assert.match(canadianHtml, /<option value="America\/Toronto" selected="">/)
  assert.match(canadianHtml, /<option value="English" selected="">English<\/option>/)
  assert.ok(canadianHtml.includes("Canadian dollars (CAD)"))
  assert.ok(canadianHtml.includes("US dollars (USD)"))
  assert.ok(canadianHtml.includes("from Canada"))
  const defaultHtml = renderToStaticMarkup(createElement(BuyerEnquiryForm, { source: "uk-test" }))
  assert.match(defaultHtml, /<option value="Europe\/London" selected="">/)
  assert.match(defaultHtml, /<option value="English" selected="">English<\/option>/)
  assert.ok(defaultHtml.includes("from the UK"))

  const losAngelesHtml = renderToStaticMarkup(createElement(BuyerEnquiryForm, {
    source: "germany-los-angeles", market: "germany", defaultRegion: "Los Angeles", defaultLocation: "Los Angeles",
  }))
  const locationInput = losAngelesHtml.match(/<input\b[^>]*\bname="targetLocation"[^>]*>/)?.[0]
  assert.ok(locationInput, "a city landing page renders a named input that FormData can submit")
  assert.match(locationInput, /\bvalue="Los Angeles"/)
  assert.match(locationInput, /\bmaxLength="160"/i)
  assert.doesNotMatch(locationInput, /\b(?:readonly|disabled)\b/i, "the prefilled city can be changed")
  const locationId = locationInput.match(/\bid="([^"]+)"/)?.[1]
  assert.ok(locationId)
  assert.ok(losAngelesHtml.includes(`for="${locationId}"`), "the city input has an associated label")
  assert.ok(losAngelesHtml.includes("Stadt oder Stadtteil (optional)"))
  assert.ok(losAngelesHtml.includes("Gewünschte Sprache der Begleitung"))
  assert.match(losAngelesHtml, /<select\b[^>]*\bname="requestedLanguage"[^>]*>[\s\S]*?<option value="German" selected="">Deutsch<\/option>/)
  assert.match(losAngelesHtml, /<option value="Los Angeles" selected="">/)

  const legacyContext = { source: "uk-legacy", pageUrl: "https://crowncoastalhomes.com/international-buyers/uk", elapsedMs: 1200 }
  const legacyUkPayload = buildUkBuyerInquiryPayload(values("uk"), legacyContext)
  assert.deepEqual(legacyUkPayload, buildBuyerInquiryPayload(values("uk"), legacyContext, "uk"))
  assert.equal(legacyUkPayload.requestedLanguage, "English")
  assert.equal(legacyUkPayload.targetLocation, undefined)
  assert.equal(legacyUkPayload.buyerOrigin, "England / UK")
  assert.equal(contactInquirySchema.safeParse(legacyUkPayload).success, true)
  const legacyWirePayload: Record<string, unknown> = { ...legacyUkPayload }
  delete legacyWirePayload.requestedLanguage
  delete legacyWirePayload.targetLocation
  assert.equal(contactInquirySchema.safeParse(legacyWirePayload).success, true, "older UK clients may omit both new fields")

  const changedCityPayload = buildBuyerInquiryPayload(buyerInquirySchemaForMarket("germany").parse({
    ...visitor, searchRegion: "Los Angeles", targetLocation: "  Santa Monica  ", requestedLanguage: "English",
  }), { ...legacyContext, source: "germany-los-angeles" }, "germany")
  assert.equal(changedCityPayload.targetLocation, "Santa Monica", "the visitor's edited city is preserved")
  assert.equal(changedCityPayload.requestedLanguage, "English", "an explicit language choice overrides the German default")

  const targetLocation = 'Los Angeles <img src=x onerror=alert(1)> & "Westside" \'LA\''
  const escapedLocation = "Los Angeles &lt;img src=x onerror=alert(1)&gt; &amp; &quot;Westside&quot; &#039;LA&#039;"

  const payloads = (["germany", "canada"] as const).map(market => ({
    market,
    payload: buildBuyerInquiryPayload(buyerInquirySchemaForMarket(market).parse({
      ...visitor, name: 'Alex <Example> & "Family"', phone: market === "germany" ? "+49 30 12345678" : "+1 416 555 0100",
      targetLocation, requestedLanguage: market === "germany" ? "English" : "German",
      budgetRange: "$1–2 million", contactPreference: "Video call", message: "Questions <script>alert(1)</script> & costs",
    }), {
      source: `${market}-buyer-main`, pageUrl: `https://crowncoastalhomes.com/international-buyers/${market}?email=private@example.test#enquire`, elapsedMs: 1200,
    }, market),
  }))
  for (const { market, payload } of payloads) {
    assert.equal(payload.buyerOrigin, BUYER_MARKET_CONFIG[market].origin)
    assert.equal(payload.timeZone, BUYER_MARKET_CONFIG[market].defaultTimeZone)
    assert.equal(payload.budgetRange, "$1–2 million", "budgets retain canonical USD values")
    assert.equal(payload.targetLocation, targetLocation)
    assert.equal(payload.requestedLanguage, market === "germany" ? "English" : "German")
    assert.equal(payload.pageUrl, `https://crowncoastalhomes.com/international-buyers/${market}`)
    assert.equal(payload.__top, 1200)
    assert.equal(contactInquirySchema.safeParse(payload).success, true)
    assert.equal(contactInquirySchema.safeParse({ ...payload, timeZone: "Invalid/Zone" }).success, false)
    assert.equal(contactInquirySchema.safeParse({ ...payload, phone: "invalid" }).success, false)
    assert.equal(contactInquirySchema.safeParse({ ...payload, buyerOrigin: "Germany\nBcc: injected" }).success, false)
    assert.equal(contactInquirySchema.safeParse({ ...payload, targetLocation: "x".repeat(160) }).success, true)
    assert.equal(contactInquirySchema.safeParse({ ...payload, targetLocation: "x".repeat(161) }).success, false)
    assert.equal(contactInquirySchema.safeParse({ ...payload, requestedLanguage: "German<script>alert(1)</script>" }).success, false)
  }
  assert.match(payloads[0].payload.message, /Hauskauf in Kalifornien aus Deutschland/)
  assert.match(payloads[0].payload.message, /Ich vergleiche noch/)
  assert.match(payloads[1].payload.message, /Buying from Canada/)
  assert.match(payloads[1].payload.message, /US dollars \(USD\), not Canadian dollars \(CAD\)/)

  const originalFetch = globalThis.fetch
  const originalKey = process.env.RESEND_API_KEY
  const messages: Array<Record<string, unknown>> = []
  let failMessage = 0
  process.env.RESEND_API_KEY = "re_test_international_buyer"
  globalThis.fetch = async (input, init) => {
    assert.equal(String(input), "https://api.resend.com/emails", "transport is mocked; never send a real request")
    messages.push(JSON.parse(String(init?.body)))
    const rejected = messages.length === failMessage
    return new Response(JSON.stringify(rejected ? { message: "Test rejection" } : { id: `test-${messages.length}` }), {
      status: rejected ? 400 : 200, headers: { "Content-Type": "application/json" },
    })
  }
  const request = (body: Record<string, unknown>) => new NextRequest("https://crowncoastalhomes.com/api/contact-info", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  })
  try {
    for (const { market, payload } of payloads) {
      messages.length = 0
      failMessage = 0
      const delivered = await POST(request(payload))
      assert.equal(delivered.status, 200)
      assert.equal(confirmedUkBuyerDelivery(delivered.ok, await delivered.json()), true)
      assert.equal(messages.length, 2)
      assert.ok(String(messages[0].subject).includes(`Buying from ${payload.buyerOrigin}`))
      const inbox = String(messages[0].html)
      assert.ok(inbox.includes(payload.timeZone))
      assert.ok(inbox.includes(payload.phone!))
      assert.ok(inbox.includes("Purchase budget (USD)"))
      assert.ok(inbox.includes(`<strong>Preferred city / neighbourhood:</strong> ${escapedLocation}`), "the requested city is included and HTML-escaped")
      assert.ok(inbox.includes(`<strong>Requested language of support:</strong> ${payload.requestedLanguage}`), "the inbox receives the chosen language, not a market-derived replacement")
      assert.ok(!inbox.includes("<img src=x"))
      assert.ok(inbox.includes("&lt;script&gt;alert(1)&lt;/script&gt; &amp; costs"))
      assert.ok(!inbox.includes("<script>"))
      const confirmation = String(messages[1].html)
      assert.ok(confirmation.includes("Alex &lt;Example&gt; &amp; &quot;Family&quot;"))
      if (market === "germany") {
        assert.match(String(messages[1].subject), /Ihre Anfrage ist eingegangen/)
        assert.match(confirmation, /Immobilienkauf in Kalifornien aus Deutschland/)
        assert.ok(!confirmation.includes("Thank you"))
      } else {
        assert.match(confirmation, /buying a California home from Canada/)
        assert.ok(!confirmation.includes("England"))
      }

      messages.length = 0
      const invalid = await POST(request({ ...payload, timeZone: "Invalid/Zone" }))
      assert.equal(invalid.status, 400)
      if (market === "germany") assert.match((await invalid.json()).error, /Bitte prüfen/)
      for (const invalidFields of [
        { targetLocation: "x".repeat(161) },
        { requestedLanguage: "French" },
        { requestedLanguage: "German<script>alert(1)</script>" },
      ]) {
        const rejected = await POST(request({ ...payload, ...invalidFields }))
        assert.equal(rejected.status, 400)
        assert.equal(messages.length, 0, "invalid city or language must not reach email transport")
      }
      const spam = await POST(request({ ...payload, company: "filled honeypot" }))
      assert.equal(spam.status, 202)
      assert.equal(confirmedUkBuyerDelivery(spam.ok, await spam.json()), false)
      assert.equal(messages.length, 0)

      failMessage = 1
      const failed = await POST(request(payload))
      assert.equal(failed.status, 502)
      const failedBody = await failed.json()
      assert.equal(confirmedUkBuyerDelivery(failed.ok, failedBody), false)
      assert.equal(failedBody.requestId, undefined)
      if (market === "germany") assert.match(failedBody.error, /nicht zugestellt/)
      assert.equal(messages.length, 1, "no visitor confirmation if inbox delivery fails")

      messages.length = 0
      failMessage = 2
      const confirmationFailed = await POST(request(payload))
      assert.equal(confirmationFailed.status, 200, "a failed receipt must not discard a delivered enquiry")
      assert.equal(confirmedUkBuyerDelivery(confirmationFailed.ok, await confirmationFailed.json()), true)
      assert.equal(messages.length, 2)
    }

    messages.length = 0
    failMessage = 0
    const legacyDelivered = await POST(request(legacyWirePayload))
    assert.equal(legacyDelivered.status, 200, "legacy UK enquiries remain deliverable without city and language fields")
    assert.equal(confirmedUkBuyerDelivery(legacyDelivered.ok, await legacyDelivered.json()), true)
    assert.equal(messages.length, 2)
    assert.match(String(messages[0].html), /Buying from England \/ UK/)
    assert.ok(!String(messages[0].html).includes("Preferred city / neighbourhood:"))
    assert.ok(!String(messages[0].html).includes("Requested language of support:"))
    assert.match(String(messages[1].html), /buying a California home from England \/ the UK/)
  } finally {
    globalThis.fetch = originalFetch
    if (originalKey === undefined) delete process.env.RESEND_API_KEY
    else process.env.RESEND_API_KEY = originalKey
  }
  console.log("internationalBuyerInquiry: all assertions passed; all email transport mocked")
}

main().catch(error => { console.error(error); process.exitCode = 1 })
