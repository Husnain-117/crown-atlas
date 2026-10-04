import { z } from "zod"
import { isInternationalPhone, isValidTimeZone } from "./contact-context"
import { CANADA_CONSULT_REGIONS, type CanadaConsultRegion } from "./canada-consult-regions"

export const CANADA_CONSULT_SOURCE = "canada_san_diego_consult"
export const CANADA_CONSULT_AREAS = ["La Jolla", "Del Mar", "Rancho Santa Fe", "Coronado", "Carmel Valley", "Encinitas / Solana Beach", "Still comparing"] as const
export const CANADA_CONSULT_BUDGETS = ["$1.5–2.5 million", "$2.5–4 million", "$4 million or more", "Prefer to discuss"] as const
export const CANADA_CONSULT_PURPOSES = ["Moving to San Diego", "Second home", "Buying ahead of a future move", "Investment", "Still deciding"] as const
export const CANADA_CONSULT_ALL_PURPOSES = ["Moving to San Diego", "Moving to Los Angeles", "Moving to Orange County", "Moving to Santa Barbara", "Second home", "Buying ahead of a future move", "Investment", "Still deciding"] as const
export const CANADA_CONSULT_TIMELINES = ["Within 3 months", "3–6 months", "6–12 months", "More than 12 months", "Prefer to discuss"] as const

export const campaignAttributionSchema = z.object({
  utm_source: z.string().trim().max(200).optional(),
  utm_medium: z.string().trim().max(200).optional(),
  utm_campaign: z.string().trim().max(200).optional(),
  utm_content: z.string().trim().max(200).optional(),
  utm_term: z.string().trim().max(200).optional(),
  ad_group: z.string().trim().max(200).optional(),
  gclid: z.string().trim().max(200).optional(),
})
export type CampaignAttribution = z.infer<typeof campaignAttributionSchema>

// Read only known advertising parameters, never arbitrary query strings or contact details.
export function readCampaignAttribution(pageUrl: string): CampaignAttribution {
  try {
    const params = new URL(pageUrl).searchParams
    return Object.fromEntries(Object.keys(campaignAttributionSchema.shape).flatMap(key => {
      const value = params.get(key)?.trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 200)
      return value ? [[key, value]] : []
    }))
  } catch { return {} }
}

export function canadaConsultSchemaForRegion(region: CanadaConsultRegion = "san-diego") {
  return z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(160),
  email: z.string().trim().email("Please enter a valid email address.").max(254),
  targetLocation: z.enum(CANADA_CONSULT_REGIONS[region].areas, { errorMap: () => ({ message: "Choose an area, or select ‘Still comparing’." }) }),
  purchaseTimeline: z.enum(CANADA_CONSULT_TIMELINES, { errorMap: () => ({ message: "Choose a buying timeline, or select ‘Prefer to discuss’." }) }),
  budgetRange: z.enum(CANADA_CONSULT_BUDGETS, { errorMap: () => ({ message: "Choose a USD budget, or select ‘Prefer to discuss’." }) }),
  propertyPurpose: z.enum(CANADA_CONSULT_ALL_PURPOSES, { errorMap: () => ({ message: "Tell us how you plan to use the home, or select ‘Still deciding’." }) }).refine(value => !value.startsWith("Moving to ") || value === `Moving to ${CANADA_CONSULT_REGIONS[region].label}`, "Please choose the purpose for this region."),
  phone: z.string().trim().max(60).refine(isInternationalPhone, "Enter your phone number with country code, or leave it blank.").optional(),
  timeZone: z.string().refine(isValidTimeZone, "Please choose a valid time zone.").default("America/Toronto"),
  message: z.string().trim().max(1000, "Please keep your message under 1,000 characters.").optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Please agree to be contacted about this consultation." }) }),
  })
}
export const canadaConsultSchema = canadaConsultSchemaForRegion()

export function buildCanadaConsultPayload(values: z.infer<typeof canadaConsultSchema>, context: { pageUrl: string; elapsedMs: number; company: string; attribution: CampaignAttribution }, region: CanadaConsultRegion = "san-diego") {
  const parsed = canadaConsultSchemaForRegion(region).parse(values)
  const config = CANADA_CONSULT_REGIONS[region]
  const url = new URL(context.pageUrl)
  return {
    ...parsed,
    source: config.source,
    buyerOrigin: "Canada" as const,
    searchRegion: config.searchRegion,
    requestedLanguage: "English" as const,
    contactPreference: "Video call" as const,
    message: parsed.message || `Request for a 20-minute ${config.label} home-buying consultation from Canada.`,
    pageUrl: `${url.origin}${url.pathname}`,
    attribution: campaignAttributionSchema.parse(context.attribution),
    company: context.company.slice(0, 200),
    __top: Math.max(0, Number.isFinite(context.elapsedMs) ? context.elapsedMs : 0),
  }
}
