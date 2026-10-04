import { randomUUID } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

import {
  contactInquirySchema,
  escapeContactHtml,
  isContactSpamProbe,
  singleLineContactText,
} from "@/lib/contact-inquiry"
import { CONTACT } from "@/lib/constants/contact"
import { CANADA_CONSULT_REGIONS, canadaConsultRegionFromSource } from "@/lib/canada-consult-regions"
import { canadaRoutingTags } from '@/lib/canada-lander'
import { CANADA_LANDER_SUCCESS } from '@/lib/canada-lander-content'
import { notifyLeadInbox, sendEmail } from "@/lib/email"
import {
  buildInquirySubject,
  buildPropertyContextHtml,
  propertyInquirySummary,
} from "@/lib/inquiry-notification"
import {
  captureLeadDeliveryError,
  recordLeadDelivery,
} from "@/lib/observability"

export async function POST(request: NextRequest) {
  const requestId = randomUUID()
  const startedAt = Date.now()
  let german = false

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 })
    }
    german = body.buyerOrigin === "Germany"

    if (isContactSpamProbe(body)) {
      return NextResponse.json({ success: true }, { status: 202 })
    }

    const parsed = contactInquirySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: german ? "Bitte prüfen Sie die Pflichtfelder und versuchen Sie es erneut." : "Please check the required fields and try again." },
        { status: 400 },
      )
    }

    const inquiry = parsed.data
    const notification = await notifyLeadInbox({
      replyTo: inquiry.email,
      subject: buildInquirySubject({
        kind: inquiry.buyerOrigin ? `Buying from ${inquiry.buyerOrigin}` : inquiry.listingKey || inquiry.propertyAddress ? "Property inquiry" : "New website inquiry",
        name: singleLineContactText(inquiry.name),
        context: {
          listingKey: inquiry.listingKey,
          propertyAddress: inquiry.propertyAddress,
          pageUrl: inquiry.propertyPageUrl || inquiry.pageUrl,
        },
      }),
      html: buildLeadInboxEmailHtml(inquiry),
    })

    if (!notification.success) {
      console.error("[contact-info] Lead inbox notification failed", notification.error)
      captureLeadDeliveryError(notification.error, {
        route: "/api/contact-info",
        requestId,
        kind: inquiry.listingKey || inquiry.propertyAddress
          ? "Property inquiry"
          : "Website inquiry",
        hasPropertyContext: Boolean(inquiry.listingKey || inquiry.propertyAddress),
        durationMs: Date.now() - startedAt,
        stage: "inbox",
      })
      return NextResponse.json(
        { success: false, error: german ? "Ihre Nachricht konnte nicht zugestellt werden. Bitte kontaktieren Sie uns direkt per Telefon oder E-Mail." : "We could not deliver your message. Please call or email us directly." },
        { status: 502 },
      )
    }

    const confirmation = await sendEmail({
      to: inquiry.email,
      subject: german ? "Ihre Anfrage ist eingegangen - Crown Coastal Homes" : "We received your message - Crown Coastal Homes",
      html: buildConfirmationEmailHtml(inquiry),
    })
    if (!confirmation.success) {
      console.error("[contact-info] Confirmation email failed", confirmation.error)
    }

    recordLeadDelivery({
      route: "/api/contact-info",
      requestId,
      kind: inquiry.listingKey || inquiry.propertyAddress
        ? "Property inquiry"
        : "Website inquiry",
      hasPropertyContext: Boolean(inquiry.listingKey || inquiry.propertyAddress),
      durationMs: Date.now() - startedAt,
    })
    return NextResponse.json(
      { success: true, requestId },
      { headers: { "Cache-Control": "no-store", "X-Lead-Request-Id": requestId } },
    )
  } catch (error) {
    console.error("[contact-info] Unexpected error", error)
    captureLeadDeliveryError(error, {
      route: "/api/contact-info",
      requestId,
      kind: "Website inquiry",
      hasPropertyContext: false,
      durationMs: Date.now() - startedAt,
      stage: "request",
    })
    return NextResponse.json(
      { success: false, error: german ? "Ihre Nachricht konnte nicht verarbeitet werden." : "Unable to process your message." },
      { status: 500 },
    )
  }
}

function buildLeadInboxEmailHtml(inquiry: ReturnType<typeof contactInquirySchema.parse>): string {
  const hasPropertyContext = Boolean(inquiry.listingKey || inquiry.propertyAddress)
  const city = canadaConsultRegionFromSource(inquiry.source)

  return `
    <h2>${inquiry.buyerOrigin ? `Buying from ${escapeContactHtml(inquiry.buyerOrigin)}` : "New Website Inquiry"}</h2>
    ${hasPropertyContext ? buildPropertyContextHtml({
      listingKey: inquiry.listingKey,
      propertyAddress: inquiry.propertyAddress,
      pageUrl: inquiry.propertyPageUrl || inquiry.pageUrl,
    }) : ""}
    <h3>Visitor</h3>
    <p><strong>Name:</strong> ${escapeContactHtml(inquiry.name)}</p>
    <p><strong>Email:</strong> ${escapeContactHtml(inquiry.email)}</p>
    <p><strong>Phone:</strong> ${escapeContactHtml(inquiry.phone || "Not provided")}</p>
    ${inquiry.buyerOrigin ? `<p><strong>Buyer origin:</strong> ${escapeContactHtml(inquiry.buyerOrigin)}</p>` : ""}
    <p><strong>Source:</strong> ${escapeContactHtml(inquiry.source)}</p>
    ${city ? `<p><strong>Routing tags:</strong> ${canadaRoutingTags(city, inquiry.budgetRange || '').map(escapeContactHtml).join(', ')}</p><p><strong>Referral possible:</strong> ${city !== 'san-diego' ? 'Yes' : 'No'}</p>` : ''}
    <p><strong>Page:</strong> ${escapeContactHtml(inquiry.pageUrl || "Not provided")}</p>
    <p><strong>Search region:</strong> ${escapeContactHtml(inquiry.searchRegion || "Not provided")}</p>
    ${inquiry.targetLocation ? `<p><strong>Preferred city / neighbourhood:</strong> ${escapeContactHtml(inquiry.targetLocation)}</p>` : ""}
    ${inquiry.requestedLanguage ? `<p><strong>Requested language of support:</strong> ${escapeContactHtml(inquiry.requestedLanguage)}</p>` : ""}
    <p><strong>Purchase timeline:</strong> ${escapeContactHtml(inquiry.purchaseTimeline || "Not provided")}</p>
    <p><strong>Call location / time zone:</strong> ${escapeContactHtml(inquiry.timeZone || "Not provided")}</p>
    <p><strong>Purchase budget (USD):</strong> ${escapeContactHtml(inquiry.budgetRange || "Not provided")}</p>
    ${inquiry.propertyPurpose ? `<p><strong>Planned use:</strong> ${escapeContactHtml(inquiry.propertyPurpose)}</p>` : ""}
    <p><strong>Preferred contact:</strong> ${escapeContactHtml(inquiry.contactPreference || "Not provided")}</p>
    ${inquiry.consent === true ? "<p><strong>Contact consent:</strong> Agreed to contact about this consultation.</p>" : ""}
    ${inquiry.attribution ? `<h3>Campaign</h3>${Object.entries(inquiry.attribution).map(([key, value]) => `<p><strong>${escapeContactHtml(key)}:</strong> ${escapeContactHtml(value)}</p>`).join("")}` : ""}
    <h3>Message</h3>
    <p>${escapeContactHtml(inquiry.message).replace(/\n/g, "<br/>")}</p>
  `
}

function buildConfirmationEmailHtml(inquiry: ReturnType<typeof contactInquirySchema.parse>): string {
  const property = propertyInquirySummary({
    listingKey: inquiry.listingKey,
    propertyAddress: inquiry.propertyAddress,
  })

  if (inquiry.buyerOrigin === "Germany") {
    return `
      <div lang="de">
        <h2>Vielen Dank für Ihre Anfrage bei Crown Coastal Homes</h2>
        <p>Guten Tag ${escapeContactHtml(inquiry.name)},</p>
        <p>Ihre Anfrage zum Immobilienkauf in Kalifornien aus Deutschland ist eingegangen. Reza prüft Ihre Angaben und meldet sich bei Ihnen.</p>
        <p>Falls Sie ein Videogespräch wünschen, stimmen Sie Termin und Zeitzone gemeinsam ab.</p>
        <p>Bei einer zeitkritischen Frage erreichen Sie uns telefonisch unter
          <a href="${CONTACT.phone.href}">${CONTACT.phone.display}</a> oder per E-Mail an
          <a href="${CONTACT.email.href}">${CONTACT.email.display}</a>.
        </p>
      </div>
    `
  }

  const consultRegion = canadaConsultRegionFromSource(inquiry.source)
  const consultLabel = consultRegion ? CANADA_CONSULT_REGIONS[consultRegion].label : undefined

  return `
    <h2>Thank you for contacting Crown Coastal Homes</h2>
    <p>Hi ${escapeContactHtml(inquiry.name)},</p>
    <p>${consultLabel ? `We received your request for a 20-minute ${consultLabel} home-buying consultation from Canada. ${CANADA_LANDER_SUCCESS} Your meeting time is confirmed separately.` : `We received your message${inquiry.buyerOrigin ? ` about buying a California home from ${inquiry.buyerOrigin === "Canada" ? "Canada" : "England / the UK"}` : property ? ` about <strong>${escapeContactHtml(property)}</strong>` : ""} and will review the details you provided.`}</p>
    <p>For a time-sensitive question, call
      <a href="${CONTACT.phone.href}">${CONTACT.phone.display}</a> or email
      <a href="${CONTACT.email.href}">${CONTACT.email.display}</a>.
    </p>
  `
}
