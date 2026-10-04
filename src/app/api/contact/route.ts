import { randomUUID } from "node:crypto"
import { NextResponse } from "next/server"
import { z } from "zod"

import { escapeContactHtml, isContactSpamProbe, singleLineContactText } from "@/lib/contact-inquiry"
import { isInternationalPhone, isValidTimeZone, isValidTourDate } from "@/lib/contact-context"
import { CONTACT } from "@/lib/constants/contact"
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

const propertyInquirySchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(60).refine(isInternationalPhone).optional().default(""),
  message: z.string().trim().max(5000).optional().default(""),
  mode: z.enum(["agent", "tour"]).optional().default("agent"),
  preferredDate: z.string().trim().max(80).optional().default(""),
  tourType: z.enum(["in-person", "virtual"]).optional().default("in-person"),
  preferredTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/).or(z.literal("")).optional().default(""),
  timeZone: z.string().min(1).max(100).refine(isValidTimeZone).optional().default("America/Los_Angeles"),
  propertyData: z.object({
    address: z.string().trim().max(500).optional().default(""),
    listing_key: z.string().trim().max(160).optional(),
    listingKey: z.string().trim().max(160).optional(),
  }).optional().default({}),
  pageUrl: z.string().trim().url().max(1000).optional(),
  company: z.string().max(200).optional().default(""),
  __top: z.coerce.number().nonnegative().optional(),
})

export async function POST(request: Request) {
  const requestId = randomUUID()
  const startedAt = Date.now()

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 })
    }

    if (isContactSpamProbe(body)) {
      return NextResponse.json({ success: true }, { status: 202 })
    }

    const parsed = propertyInquirySchema.safeParse(body)
    if (!parsed.success || (parsed.success && parsed.data.mode === "tour" && !isValidTourDate(parsed.data.preferredDate, parsed.data.timeZone))) {
      return NextResponse.json(
        { success: false, error: "Please check the required fields and try again." },
        { status: 400 },
      )
    }

    if (!process.env.RESEND_API_KEY) {
      captureLeadDeliveryError(new Error("RESEND_API_KEY is not configured"), {
        route: "/api/contact",
        requestId,
        kind: "Property inquiry",
        hasPropertyContext: false,
        durationMs: Date.now() - startedAt,
        stage: "configuration",
      })
      return NextResponse.json(
        { success: false, error: "Inquiry service is temporarily unavailable." },
        { status: 503 },
      )
    }

    const inquiry = parsed.data
    const listingKey = inquiry.propertyData.listing_key || inquiry.propertyData.listingKey || ""
    const propertyContext = {
      listingKey,
      propertyAddress: inquiry.propertyData.address,
      pageUrl: inquiry.pageUrl,
    }
    const result = await notifyLeadInbox({
      replyTo: inquiry.email,
      subject: buildInquirySubject({
        kind: inquiry.mode === "tour" ? "Tour request" : "Property inquiry",
        name: singleLineContactText(inquiry.name),
        context: propertyContext,
      }),
      html: `
        <h2>${inquiry.mode === "tour" ? "New Tour Request" : "New Property Inquiry"}</h2>
        ${buildPropertyContextHtml(propertyContext)}
        <h3>Visitor</h3>
        <p><strong>Name:</strong> ${escapeContactHtml(inquiry.name)}</p>
        <p><strong>Email:</strong> ${escapeContactHtml(inquiry.email)}</p>
        <p><strong>Phone:</strong> ${escapeContactHtml(inquiry.phone || "Not provided")}</p>
        <p><strong>Preferred date:</strong> ${escapeContactHtml(inquiry.preferredDate || "Not provided")}</p>
        <p><strong>Tour format:</strong> ${inquiry.tourType === "virtual" ? "Live video tour" : "In person"}</p>
        <p><strong>Preferred time:</strong> ${escapeContactHtml(inquiry.preferredTime || "To be arranged")}</p>
        <p><strong>Time zone:</strong> ${escapeContactHtml(inquiry.timeZone)}</p>
        <h3>Message</h3>
        <p>${escapeContactHtml(inquiry.message || "None").replace(/\n/g, "<br/>")}</p>
      `,
    })

    if (!result.success) {
      console.error("[contact] Admin notification failed", result.error)
      captureLeadDeliveryError(result.error, {
        route: "/api/contact",
        requestId,
        kind: inquiry.mode === "tour" ? "Tour request" : "Property inquiry",
        hasPropertyContext: Boolean(listingKey || inquiry.propertyData.address),
        durationMs: Date.now() - startedAt,
        stage: "inbox",
      })
      return NextResponse.json(
        { success: false, error: "We could not send the request. Please call or email us directly." },
        { status: 502 },
      )
    }

    const confirmation = await sendEmail({
      to: inquiry.email,
      subject: "We received your request - Crown Coastal Homes",
      html: `
        <h2>Thank you for contacting Crown Coastal Homes</h2>
        <p>Hi ${escapeContactHtml(inquiry.name)},</p>
        <p>We received your ${inquiry.mode === "tour" ? "tour request" : "property inquiry"} for
          <strong>${escapeContactHtml(propertyInquirySummary(propertyContext) || "the property you selected")}</strong>
          and will review the details.
        </p>
        ${inquiry.mode === "tour" ? `<p>Requested format: ${inquiry.tourType === "virtual" ? "live video tour" : "in person"}. Preferred date: ${escapeContactHtml(inquiry.preferredDate)}${inquiry.preferredTime ? ` at ${escapeContactHtml(inquiry.preferredTime)}` : ""} (${escapeContactHtml(inquiry.timeZone)}). We will confirm availability and the appointment with you.</p>` : ""}
        <p>For a time-sensitive question, call
          <a href="${CONTACT.phone.href}">${CONTACT.phone.display}</a> or email
          <a href="${CONTACT.email.href}">${CONTACT.email.display}</a>.
        </p>
      `,
    })
    if (!confirmation.success) {
      console.error("[contact] Confirmation email failed", confirmation.error)
    }

    recordLeadDelivery({
      route: "/api/contact",
      requestId,
      kind: inquiry.mode === "tour" ? "Tour request" : "Property inquiry",
      hasPropertyContext: Boolean(listingKey || inquiry.propertyData.address),
      durationMs: Date.now() - startedAt,
    })
    return NextResponse.json(
      { success: true, requestId },
      { headers: { "Cache-Control": "no-store", "X-Lead-Request-Id": requestId } },
    )
  } catch (error) {
    console.error("[contact] Unexpected error", error)
    captureLeadDeliveryError(error, {
      route: "/api/contact",
      requestId,
      kind: "Property inquiry",
      hasPropertyContext: false,
      durationMs: Date.now() - startedAt,
      stage: "request",
    })
    return NextResponse.json(
      { success: false, error: "Unable to process the request." },
      { status: 500 },
    )
  }
}
