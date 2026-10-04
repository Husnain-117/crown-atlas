import { z } from "zod"

import { escapeContactHtml } from "@/lib/contact-inquiry"
import {
  buildInquirySubject,
  buildPropertyContextHtml,
  propertyInquirySummary,
} from "@/lib/inquiry-notification"

export const tourBookingSchema = z.object({
  tourType: z.enum(["in-person", "video", "self-guided"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^(0?[1-9]|1[0-2]):[0-5]\d [AP]M$/),
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(5).max(60),
  propertyAddress: z.string().trim().min(2).max(500),
  propertyKey: z.string().trim().min(1).max(160),
  pageUrl: z.string().trim().url().max(1000).optional(),
  company: z.string().max(200).optional().default(""),
  __top: z.coerce.number().nonnegative().optional(),
})

export type TourBooking = z.infer<typeof tourBookingSchema>

export function buildTourAdminSubject(booking: TourBooking): string {
  return buildInquirySubject({
    kind: "Tour request",
    name: booking.name,
    context: propertyContext(booking),
  })
}

export function buildTourAdminEmailHtml(booking: TourBooking): string {
  return `
    <h2>New Property Tour Request</h2>
    ${buildPropertyContextHtml(propertyContext(booking))}
    <h3>Requested Tour</h3>
    <p><strong>Type:</strong> ${escapeContactHtml(booking.tourType)}</p>
    <p><strong>Date:</strong> ${escapeContactHtml(booking.date)}</p>
    <p><strong>Time:</strong> ${escapeContactHtml(booking.time)}</p>
    <h3>Visitor</h3>
    <p><strong>Name:</strong> ${escapeContactHtml(booking.name)}</p>
    <p><strong>Email:</strong> ${escapeContactHtml(booking.email)}</p>
    <p><strong>Phone:</strong> ${escapeContactHtml(booking.phone)}</p>
  `
}

export function buildTourConfirmationEmailHtml(booking: TourBooking, mapsUrl: string): string {
  return `
    <h2>We received your tour request</h2>
    <p>Hi ${escapeContactHtml(booking.name)},</p>
    <p>We received your ${escapeContactHtml(booking.tourType)} tour request for
      <strong>${escapeContactHtml(propertyInquirySummary(propertyContext(booking)))}</strong>.
    </p>
    <p><strong>Requested time:</strong> ${escapeContactHtml(booking.date)} at ${escapeContactHtml(booking.time)}</p>
    <p><a href="${escapeContactHtml(mapsUrl)}">Open the property in Google Maps</a></p>
    <p>We will follow up to confirm availability. Reply to this email if you need to make a change.</p>
  `
}

function propertyContext(booking: TourBooking) {
  return {
    listingKey: booking.propertyKey,
    propertyAddress: booking.propertyAddress,
    pageUrl: booking.pageUrl,
  }
}
