import { z } from "zod"
import { BUYER_LANGUAGES, BUYER_ORIGINS, UK_BUYER_BUDGETS, UK_BUYER_CONTACT_PREFERENCES } from "./uk-buyer-inquiry"
import { isInternationalPhone, isValidTimeZone } from "./contact-context"
import { CANADA_CONSULT_BUDGETS, CANADA_CONSULT_ALL_PURPOSES, canadaConsultSchemaForRegion, campaignAttributionSchema } from "./canada-consult-inquiry"
import { CANADA_CONSULT_REGIONS, canadaConsultRegionFromSource } from "./canada-consult-regions"

export const contactInquirySchema = z.object({
  name: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(60).optional().default(""),
  message: z.string().trim().min(2).max(5000),
  source: z.string().trim().min(1).max(80).optional().default("contact_page"),
  pageUrl: z.string().trim().url().max(1000).optional(),
  propertyPageUrl: z.string().trim().url().max(1000).optional(),
  listingKey: z.string().trim().max(160).optional(),
  propertyAddress: z.string().trim().max(500).optional(),
  searchRegion: z.string().trim().max(200).optional(),
  purchaseTimeline: z.string().trim().max(100).optional(),
  timeZone: z.string().trim().max(100).optional(),
  budgetRange: z.union([z.enum(UK_BUYER_BUDGETS), z.enum(CANADA_CONSULT_BUDGETS)]).optional(),
  propertyPurpose: z.enum(CANADA_CONSULT_ALL_PURPOSES).optional(),
  consent: z.boolean().optional(),
  attribution: campaignAttributionSchema.optional(),
  contactPreference: z.enum(UK_BUYER_CONTACT_PREFERENCES).optional(),
  buyerOrigin: z.enum(BUYER_ORIGINS).optional(),
  targetLocation: z.string().trim().max(160).optional(),
  requestedLanguage: z.enum(BUYER_LANGUAGES).optional(),
  company: z.string().max(200).optional().default(""),
  __top: z.coerce.number().nonnegative().optional(),
}).superRefine((inquiry, ctx) => {
  const consultRegion = canadaConsultRegionFromSource(inquiry.source)
  if (consultRegion) {
    const consult = canadaConsultSchemaForRegion(consultRegion).safeParse(inquiry)
    if (!consult.success) consult.error.issues.forEach(issue => ctx.addIssue(issue))
    if (inquiry.searchRegion !== CANADA_CONSULT_REGIONS[consultRegion].searchRegion) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["searchRegion"], message: "Please check the search region." })
    if (inquiry.buyerOrigin !== "Canada") ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["buyerOrigin"], message: "Please check the buyer origin." })
  }
  // Other contact entry points historically accept free-text location labels.
  if (!inquiry.buyerOrigin) return
  const german = inquiry.buyerOrigin === "Germany"
  if (!inquiry.timeZone || !isValidTimeZone(inquiry.timeZone)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["timeZone"], message: german ? "Bitte wählen Sie eine gültige Zeitzone." : "Please choose a valid time zone." })
  }
  if (!isInternationalPhone(inquiry.phone)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: german ? "Bitte prüfen Sie Ihre Telefonnummer mit Ländervorwahl." : "Please check your phone number, including its country code." })
  }
})

export type ContactInquiry = z.infer<typeof contactInquirySchema>

export function escapeContactHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function singleLineContactText(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim()
}

export function isContactSpamProbe(input: { company?: unknown; __top?: unknown }): boolean {
  if (typeof input.company === "string" && input.company.trim().length > 0) return true

  const elapsed = Number(input.__top)
  return Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 750
}
