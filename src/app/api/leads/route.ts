import { randomUUID } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

import { parseUTMFromURL } from "@/lib/analytics/utm"
import { escapeContactHtml, singleLineContactText } from "@/lib/contact-inquiry"
import { notifyLeadInbox } from "@/lib/email"
import { buildInquirySubject, buildPropertyContextHtml } from "@/lib/inquiry-notification"
import { isLeadSpamProbe, leadDisplayName, leadInquirySchema, type LeadInquiry } from "@/lib/lead-inquiry"
import {
  captureLeadDeliveryError,
  recordLeadDelivery,
} from "@/lib/observability"
import { classifySeoPage, pathnameFromUrl } from "@/lib/analytics/page-classification"

type LeadEmailPayload = Omit<LeadInquiry, "company" | "__top"> & {
  fullName: string
  email: string
  listingKey?: string
  pageUrl?: string
  pageType?: string
  referer?: string
  userAgent?: string
  campaign?: string | null
  medium?: string | null
  content?: string | null
  term?: string | null
  gclid?: string | null
  fbclid?: string | null
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID()
  const startedAt = Date.now()

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 })
    }

    if (isLeadSpamProbe(body)) {
      return NextResponse.json({ success: true, ok: true }, { status: 202 })
    }

    const parsed = leadInquirySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Please check the required fields and try again." },
        { status: 400 },
      )
    }

    const inquiry = parsed.data
    const fullName = leadDisplayName(inquiry)
    const requestUrl = new URL(request.url)
    const utm = parseUTMFromURL(requestUrl)
    utm.source ||= request.cookies.get("utm_source")?.value ?? undefined
    utm.medium ||= request.cookies.get("utm_medium")?.value ?? undefined
    utm.campaign ||= request.cookies.get("utm_campaign")?.value ?? undefined
    utm.content ||= request.cookies.get("utm_content")?.value ?? undefined
    utm.term ||= request.cookies.get("utm_term")?.value ?? undefined
    utm.gclid ||= request.cookies.get("gclid")?.value ?? undefined
    utm.fbclid ||= request.cookies.get("fbclid")?.value ?? undefined

    const listingKey = inquiry.listingKey || inquiry.propertyId
    const pageUrl = inquiry.pageUrl || request.headers.get("referer") || undefined
    const lead: LeadEmailPayload = {
      firstName: inquiry.firstName || fullName.split(/\s+/)[0],
      lastName: inquiry.lastName || fullName.split(/\s+/).slice(1).join(" "),
      fullName,
      email: inquiry.email.toLowerCase(),
      phone: inquiry.phone,
      message: inquiry.message,
      city: inquiry.city,
      state: inquiry.state,
      county: inquiry.county,
      budgetMin: inquiry.budgetMin,
      budgetMax: inquiry.budgetMax,
      beds: inquiry.beds,
      baths: inquiry.baths,
      propertyType: inquiry.propertyType,
      wantsTour: inquiry.wantsTour,
      isCashBuyer: inquiry.isCashBuyer,
      timeframe: inquiry.timeframe,
      contactPreference: inquiry.contactPreference,
      tags: listingKey && !inquiry.tags.some((tag) => tag.startsWith("prop:"))
        ? [...inquiry.tags, `prop:${listingKey}`]
        : inquiry.tags,
      listingKey,
      propertyAddress: inquiry.propertyAddress,
      preferredTourDate: inquiry.preferredTourDate,
      preferredTourTime: inquiry.preferredTourTime,
      tourType: inquiry.tourType,
      pageUrl,
      pageType: classifySeoPage(pathnameFromUrl(pageUrl)),
      referer: request.headers.get("referer") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
      source: inquiry.source || utm.source || "website",
      campaign: utm.campaign,
      medium: utm.medium,
      content: utm.content,
      term: utm.term,
      gclid: utm.gclid,
      fbclid: utm.fbclid,
    }
    const notification = await notifyLeadInbox({
      replyTo: lead.email,
      subject: buildInquirySubject({
        kind: leadNotificationKind(lead),
        name: singleLineContactText(fullName),
        context: {
          listingKey: lead.listingKey,
          propertyAddress: lead.propertyAddress,
          pageUrl: lead.pageUrl,
        },
      }),
      html: buildLeadEmailHtml(lead),
    })

    if (!notification.success) {
      console.error("[leads] Lead inbox notification failed", notification.error)
      captureLeadDeliveryError(notification.error, {
        route: "/api/leads",
        requestId,
        kind: leadNotificationKind(lead),
        hasPropertyContext: Boolean(lead.listingKey || lead.propertyAddress),
        durationMs: Date.now() - startedAt,
        stage: "inbox",
      })
      return NextResponse.json(
        { success: false, error: "We could not deliver your request. Please call or email us directly." },
        { status: 502 },
      )
    }

    recordLeadDelivery({
      route: "/api/leads",
      requestId,
      kind: leadNotificationKind(lead),
      hasPropertyContext: Boolean(lead.listingKey || lead.propertyAddress),
      durationMs: Date.now() - startedAt,
    })
    return NextResponse.json(
      { success: true, ok: true, requestId },
      { headers: { "Cache-Control": "no-store", "X-Lead-Request-Id": requestId } },
    )
  } catch (error) {
    console.error("[leads] Unexpected error", error)
    captureLeadDeliveryError(error, {
      route: "/api/leads",
      requestId,
      kind: "request",
      hasPropertyContext: false,
      durationMs: Date.now() - startedAt,
      stage: "request",
    })
    return NextResponse.json({ success: false, error: "Unable to process the request." }, { status: 500 })
  }
}

function buildLeadEmailHtml(lead: LeadEmailPayload): string {
  const hasPropertyContext = Boolean(lead.listingKey || lead.propertyAddress)

  return `
    <h2>New Website Lead</h2>
    ${hasPropertyContext ? buildPropertyContextHtml({
      listingKey: lead.listingKey,
      propertyAddress: lead.propertyAddress,
      pageUrl: lead.pageUrl,
    }) : ""}
    <h3>Visitor</h3>
    <p><strong>Name:</strong> ${escapeContactHtml(lead.fullName || "Website visitor")}</p>
    <p><strong>Email:</strong> ${escapeContactHtml(lead.email || "Not provided")}</p>
    <p><strong>Phone:</strong> ${escapeContactHtml(lead.phone || "Not provided")}</p>
    <p><strong>Location:</strong> ${escapeContactHtml([lead.city, lead.state, lead.county].filter(Boolean).join(", ") || "Not provided")}</p>
    <p><strong>Budget:</strong> ${escapeContactHtml(formatBudget(lead))}</p>
    <p><strong>Timeframe:</strong> ${escapeContactHtml(lead.timeframe || "Not provided")}</p>
    <p><strong>Contact preference:</strong> ${escapeContactHtml(lead.contactPreference || "Not provided")}</p>
    <p><strong>Tour:</strong> ${escapeContactHtml(formatTour(lead))}</p>
    <p><strong>Source:</strong> ${escapeContactHtml(lead.source || "website")}</p>
    <p><strong>Page:</strong> ${escapeContactHtml(lead.pageUrl || "Not provided")}</p>
    <p><strong>SEO page type:</strong> ${escapeContactHtml(lead.pageType || "other")}</p>
    <p><strong>Tags:</strong> ${escapeContactHtml(lead.tags?.join(", ") || "None")}</p>
    <h3>Message</h3>
    <p>${escapeContactHtml(lead.message || "None").replace(/\n/g, "<br/>")}</p>
  `
}

function formatBudget(lead: LeadEmailPayload): string {
  if (!lead.budgetMin && !lead.budgetMax) return "Not provided"
  const minimum = lead.budgetMin ? `$${Number(lead.budgetMin).toLocaleString("en-US")}` : "No minimum"
  const maximum = lead.budgetMax ? `$${Number(lead.budgetMax).toLocaleString("en-US")}` : "No maximum"
  return `${minimum} - ${maximum}`
}

function formatTour(lead: LeadEmailPayload): string {
  if (!lead.wantsTour && !lead.preferredTourDate && !lead.preferredTourTime) return "No"
  return [
    lead.tourType || "Requested",
    lead.preferredTourDate,
    lead.preferredTourTime,
  ].filter(Boolean).join(" | ")
}

function leadNotificationKind(lead: LeadEmailPayload): string {
  if (lead.wantsTour) return "Tour request"
  if (lead.tags?.includes("financing-inquiry")) return "Financing inquiry"
  if (lead.listingKey || lead.propertyAddress) return "Property inquiry"
  return "New website lead"
}
