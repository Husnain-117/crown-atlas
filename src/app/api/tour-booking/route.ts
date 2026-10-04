import { randomUUID } from "node:crypto"
import { createEvent } from "ics"
import { NextResponse } from "next/server"

import { isContactSpamProbe } from "@/lib/contact-inquiry"
import { CONTACT } from "@/lib/constants/contact"
import { notifyLeadInbox, sendEmail } from "@/lib/email"
import {
  buildTourAdminEmailHtml,
  buildTourAdminSubject,
  buildTourConfirmationEmailHtml,
  tourBookingSchema,
} from "@/lib/tour-booking"
import {
  captureLeadDeliveryError,
  recordLeadDelivery,
} from "@/lib/observability"

function to24Hour(time: string): [number, number] {
  const [hm, ampm] = time.split(" ")
  const [hRaw, mRaw] = hm.split(":").map(Number)
  let hour = hRaw
  if (ampm === "PM" && hour !== 12) hour += 12
  if (ampm === "AM" && hour === 12) hour = 0
  return [hour, mRaw || 0]
}

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

    const parsed = tourBookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Please complete all required tour details." },
        { status: 400 },
      )
    }

    if (!process.env.RESEND_API_KEY) {
      captureLeadDeliveryError(new Error("RESEND_API_KEY is not configured"), {
        route: "/api/tour-booking",
        requestId,
        kind: "Tour request",
        hasPropertyContext: false,
        durationMs: Date.now() - startedAt,
        stage: "configuration",
      })
      return NextResponse.json(
        { success: false, error: "Tour request service is temporarily unavailable." },
        { status: 503 },
      )
    }

    const booking = parsed.data
    const [year, month, day] = booking.date.split("-").map(Number)
    const [hour, minute] = to24Hour(booking.time)
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.propertyAddress)}`
    const { error: calendarError, value: calendarInvite } = createEvent({
      title: `Property Tour - ${booking.propertyAddress}`,
      start: [year, month, day, hour, minute],
      duration: { hours: 1 },
      description: [
        `${booking.tourType} tour with Crown Coastal Homes`,
        `Listing ID: ${booking.propertyKey}`,
        booking.pageUrl ? `Property page: ${booking.pageUrl}` : "",
      ].filter(Boolean).join("\n"),
      location: booking.propertyAddress,
      organizer: { name: CONTACT.business.name, email: CONTACT.email.display },
    })

    if (calendarError || !calendarInvite) {
      console.error("[tour-booking] Calendar invite generation failed", calendarError)
      captureLeadDeliveryError(calendarError || new Error("Calendar invite is empty"), {
        route: "/api/tour-booking",
        requestId,
        kind: "Tour request",
        hasPropertyContext: true,
        durationMs: Date.now() - startedAt,
        stage: "calendar",
      })
      return NextResponse.json(
        { success: false, error: "We could not prepare the tour request." },
        { status: 500 },
      )
    }

    const adminNotification = await notifyLeadInbox({
      replyTo: booking.email,
      subject: buildTourAdminSubject(booking),
      html: buildTourAdminEmailHtml(booking),
    })

    if (!adminNotification.success) {
      console.error("[tour-booking] Admin notification failed", adminNotification.error)
      captureLeadDeliveryError(adminNotification.error, {
        route: "/api/tour-booking",
        requestId,
        kind: "Tour request",
        hasPropertyContext: true,
        durationMs: Date.now() - startedAt,
        stage: "inbox",
      })
      return NextResponse.json(
        { success: false, error: "We could not send the tour request. Please call or email us directly." },
        { status: 502 },
      )
    }

    const confirmation = await sendEmail({
      to: booking.email,
      replyTo: CONTACT.email.display,
      subject: `Tour request received - ${booking.propertyAddress}`,
      html: buildTourConfirmationEmailHtml(booking, mapsUrl),
      attachments: [{
        filename: "tour-request.ics",
        content: Buffer.from(calendarInvite).toString("base64"),
        contentType: "text/calendar",
      }],
    })
    if (!confirmation.success) {
      console.error("[tour-booking] Confirmation email failed", confirmation.error)
    }

    recordLeadDelivery({
      route: "/api/tour-booking",
      requestId,
      kind: "Tour request",
      hasPropertyContext: true,
      durationMs: Date.now() - startedAt,
    })
    return NextResponse.json(
      { success: true, requestId },
      { headers: { "Cache-Control": "no-store", "X-Lead-Request-Id": requestId } },
    )
  } catch (error) {
    console.error("[tour-booking] Unexpected error", error)
    captureLeadDeliveryError(error, {
      route: "/api/tour-booking",
      requestId,
      kind: "Tour request",
      hasPropertyContext: false,
      durationMs: Date.now() - startedAt,
      stage: "request",
    })
    return NextResponse.json(
      { success: false, error: "Unable to process the tour request." },
      { status: 500 },
    )
  }
}
