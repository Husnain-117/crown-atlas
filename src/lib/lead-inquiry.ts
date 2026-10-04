import { z } from "zod"

const optionalNumber = z.preprocess(
  (value) => value === "" || value === null || value === undefined ? undefined : Number(value),
  z.number().finite().nonnegative().optional(),
)

const optionalBoolean = z.preprocess(
  (value) => value === true || value === "true" || value === "on" || value === 1,
  z.boolean().optional(),
)

export const leadInquirySchema = z.object({
  name: z.string().trim().max(160).optional(),
  firstName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().max(80).optional(),
  fullName: z.string().trim().max(160).optional(),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(60).optional().default(""),
  message: z.string().trim().max(5000).optional().default(""),
  city: z.string().trim().max(160).optional(),
  state: z.string().trim().max(80).optional(),
  county: z.string().trim().max(160).optional(),
  budgetMin: optionalNumber,
  budgetMax: optionalNumber,
  beds: z.union([z.number().finite().nonnegative(), z.string().trim().max(20)]).optional(),
  baths: z.union([z.number().finite().nonnegative(), z.string().trim().max(20)]).optional(),
  propertyType: z.string().trim().max(100).optional(),
  wantsTour: optionalBoolean,
  isCashBuyer: optionalBoolean,
  timeframe: z.enum(["now", "30d", "90d", "later"]).optional(),
  contactPreference: z.enum(["sms", "email", "phone", "any"]).optional(),
  tags: z.array(z.string().trim().min(1).max(100)).max(20).optional().default([]),
  source: z.string().trim().max(100).optional(),
  pageUrl: z.string().trim().url().max(1000).optional(),
  propertyId: z.string().trim().max(160).optional(),
  listingKey: z.string().trim().max(160).optional(),
  propertyAddress: z.string().trim().max(500).optional(),
  preferredTourDate: z.string().trim().max(40).optional(),
  preferredTourTime: z.string().trim().max(40).optional(),
  tourType: z.string().trim().max(80).optional(),
  company: z.string().max(200).optional().default(""),
  __top: z.coerce.number().nonnegative().optional(),
})

export type LeadInquiry = z.infer<typeof leadInquirySchema>

export function leadDisplayName(inquiry: LeadInquiry): string {
  return (
    inquiry.fullName ||
    inquiry.name ||
    [inquiry.firstName, inquiry.lastName].filter(Boolean).join(" ") ||
    "Website visitor"
  )
}

export function isLeadSpamProbe(input: { company?: unknown; __top?: unknown }): boolean {
  if (typeof input.company === "string" && input.company.trim().length > 0) return true
  const elapsed = Number(input.__top)
  return Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 750
}
