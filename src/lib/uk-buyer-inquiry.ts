import { z } from "zod"
import { isInternationalPhone, isValidTimeZone } from "./contact-context"

export const UK_BUYER_REGIONS = [
  "San Diego / La Jolla",
  "Los Angeles",
  "Orange County",
  "San Francisco / Bay Area",
  "Santa Barbara",
  "Still comparing",
] as const

export const UK_BUYER_TIMELINES = [
  "Within 3 months",
  "3–6 months",
  "6–12 months",
  "More than 12 months",
  "Just exploring",
] as const

export const UK_BUYER_BUDGETS = [
  "Under $1 million",
  "$1–2 million",
  "$2–3 million",
  "$3–5 million",
  "$5 million or more",
  "Still working out my budget",
] as const

export const UK_BUYER_CONTACT_PREFERENCES = ["Email", "Video call"] as const
export const BUYER_LANGUAGES = ["English", "German"] as const
export const UK_BUYER_ORIGIN = "England / UK" as const
export const BUYER_ORIGINS = [UK_BUYER_ORIGIN, "Germany", "Canada"] as const
export type BuyerMarket = "uk" | "germany" | "canada"

export const BUYER_MARKET_CONFIG = {
  uk: { origin: UK_BUYER_ORIGIN, defaultTimeZone: "Europe/London", phonePlaceholder: "e.g. +44 20 7946 0958" },
  germany: { origin: "Germany", defaultTimeZone: "Europe/Berlin", phonePlaceholder: "z. B. +49 30 12345678" },
  canada: { origin: "Canada", defaultTimeZone: "America/Toronto", phonePlaceholder: "e.g. +1 416 555 0100" },
} as const

// Use location identifiers, not fixed UTC offsets: local clock rules can change.
export const CANADIAN_BUYER_TIME_ZONES = [
  { value: "America/Halifax", label: "Atlantic — Halifax" },
  { value: "America/St_Johns", label: "Newfoundland — St. John’s" },
  { value: "America/Toronto", label: "Eastern — Toronto / Montréal" },
  { value: "America/Winnipeg", label: "Central — Winnipeg" },
  { value: "America/Regina", label: "Saskatchewan — Regina" },
  { value: "America/Edmonton", label: "Mountain — Edmonton / Calgary" },
  { value: "America/Vancouver", label: "Pacific — Vancouver" },
  { value: "America/Whitehorse", label: "Yukon — Whitehorse" },
] as const

export function buyerTimeZoneOptions(market: BuyerMarket = "uk", localZone = ""): Array<{ value: string; label: string }> {
  const options: Array<{ value: string; label: string }> = market === "canada"
    ? CANADIAN_BUYER_TIME_ZONES.map(zone => ({ ...zone }))
    : [{ value: BUYER_MARKET_CONFIG[market].defaultTimeZone, label: market === "germany" ? "Deutschland — Berlin" : "UK — London" }]
  options.push({ value: "America/Los_Angeles", label: market === "germany" ? "Kalifornien — Los Angeles" : "California — Los Angeles" })
  if (localZone && isValidTimeZone(localZone)) {
    const detected = market === "germany" ? "auf diesem Gerät erkannt" : "detected on this device"
    const existing = options.find(zone => zone.value === localZone)
    if (existing) existing.label += ` (${detected})`
    else options.push({ value: localZone, label: `${localZone.replace(/_/g, " ")} (${detected})` })
  }
  return options
}

const germanOptionLabels: Record<string, string> = {
  "Still comparing": "Ich vergleiche noch",
  "Within 3 months": "Innerhalb von 3 Monaten",
  "3–6 months": "In 3–6 Monaten",
  "6–12 months": "In 6–12 Monaten",
  "More than 12 months": "In mehr als 12 Monaten",
  "Just exploring": "Ich informiere mich zunächst",
  "Under $1 million": "Unter 1 Mio. US-Dollar",
  "$1–2 million": "1–2 Mio. US-Dollar",
  "$2–3 million": "2–3 Mio. US-Dollar",
  "$3–5 million": "3–5 Mio. US-Dollar",
  "$5 million or more": "Ab 5 Mio. US-Dollar",
  "Still working out my budget": "Mein Budget steht noch nicht fest",
  "Email": "E-Mail",
  "Video call": "Videogespräch",
  "English": "Englisch",
  "German": "Deutsch",
}

/** Translate the display text while preserving values accepted by the inbox. */
export function buyerOptionLabel(value: string, market: BuyerMarket = "uk"): string {
  return market === "germany" ? germanOptionLabels[value] || value : value
}

export function buyerInquirySchemaForMarket(market: BuyerMarket = "uk") {
  const german = market === "germany"
  const text = (en: string, de: string) => german ? de : en
  const phoneError = text("Enter a phone number including its country code, or leave this blank.", "Bitte geben Sie eine Telefonnummer mit Ländervorwahl ein oder lassen Sie das Feld leer.")
  const zoneError = text("Please choose a valid time zone.", "Bitte wählen Sie eine gültige Zeitzone.")
  return z.object({
    name: z.string({ required_error: text("Please enter your full name.", "Bitte geben Sie Ihren vollständigen Namen ein.") }).trim()
      .min(2, text("Please enter your full name.", "Bitte geben Sie Ihren vollständigen Namen ein."))
      .max(160, text("Please use 160 characters or fewer.", "Bitte verwenden Sie höchstens 160 Zeichen.")),
    email: z.string({ required_error: text("Please enter a valid email address.", "Bitte geben Sie eine gültige E-Mail-Adresse ein.") }).trim()
      .email(text("Please enter a valid email address.", "Bitte geben Sie eine gültige E-Mail-Adresse ein."))
      .max(254, text("Please check your email address.", "Bitte prüfen Sie Ihre E-Mail-Adresse.")),
    searchRegion: z.enum(UK_BUYER_REGIONS, { errorMap: () => ({ message: text("Choose an area, or select ‘Still comparing’.", "Bitte wählen Sie eine Region oder ‚Ich vergleiche noch‘.") }) }),
    targetLocation: z.string().trim().max(160, text("Please use 160 characters or fewer.", "Bitte verwenden Sie höchstens 160 Zeichen.")).optional(),
    requestedLanguage: z.enum(BUYER_LANGUAGES, { errorMap: () => ({ message: text("Please choose English or German.", "Bitte wählen Sie Deutsch oder Englisch.") }) }).default(german ? "German" : "English"),
    purchaseTimeline: z.union([z.enum(UK_BUYER_TIMELINES), z.literal("")], { errorMap: () => ({ message: text("Please choose a timeline, or leave this blank.", "Bitte wählen Sie einen Zeitraum oder lassen Sie das Feld leer.") }) }).optional(),
    budgetRange: z.union([z.enum(UK_BUYER_BUDGETS), z.literal("")], { errorMap: () => ({ message: text("Please choose a budget, or leave this blank.", "Bitte wählen Sie ein Budget oder lassen Sie das Feld leer.") }) }).optional(),
    phone: z.string().trim().max(60, phoneError).refine(isInternationalPhone, phoneError).optional(),
    contactPreference: z.enum(UK_BUYER_CONTACT_PREFERENCES, { errorMap: () => ({ message: text("Please choose email or a video call.", "Bitte wählen Sie E-Mail oder Videogespräch.") }) }).default("Email"),
    timeZone: z.string().trim().min(1, zoneError).max(100, zoneError).refine(isValidTimeZone, zoneError).default(BUYER_MARKET_CONFIG[market].defaultTimeZone),
    message: z.string().trim().max(4000, text("Please keep your message under 4,000 characters.", "Bitte verwenden Sie für Ihre Nachricht höchstens 4.000 Zeichen.")).optional(),
  })
}

export const ukBuyerInquirySchema = buyerInquirySchemaForMarket("uk")

export type UkBuyerInquiryValues = z.infer<typeof ukBuyerInquirySchema>
export type UkBuyerField = keyof UkBuyerInquiryValues

export function resolveUkBuyerRegion(region?: string): typeof UK_BUYER_REGIONS[number] {
  return UK_BUYER_REGIONS.find(value => value === region) ?? "Still comparing"
}

/** Keep the enquiry source URL, excluding query strings that may contain PII. */
function enquiryPageUrl(value: string): string | undefined {
  try {
    const url = new URL(value)
    if (!["https:", "http:"].includes(url.protocol)) return undefined
    return `${url.origin}${url.pathname}`.slice(0, 1000)
  } catch {
    return undefined
  }
}

type BuyerInquiryContext = {
  source: string
  pageUrl: string
  company?: string
  elapsedMs: number
}

export function buildBuyerInquiryPayload(values: UkBuyerInquiryValues, context: BuyerInquiryContext, market: BuyerMarket = "uk") {
  const parsed = buyerInquirySchemaForMarket(market).parse(values)
  const origin = BUYER_MARKET_CONFIG[market].origin
  return {
    ...parsed,
    budgetRange: parsed.budgetRange || undefined,
    purchaseTimeline: parsed.purchaseTimeline || undefined,
    buyerOrigin: origin,
    message: [
      market === "germany" ? "Hauskauf in Kalifornien aus Deutschland" : `Buying from ${origin}`,
      market === "germany"
        ? `Ich möchte den Kauf einer Immobilie in Kalifornien besprechen. Region: ${buyerOptionLabel(parsed.searchRegion, market)}.`
        : `I would like to discuss buying a home in California. Area: ${parsed.searchRegion}.`,
      market === "canada" ? "Any selected purchase budget is in US dollars (USD), not Canadian dollars (CAD)." : "",
      parsed.message,
    ].filter(Boolean).join("\n\n"),
    source: context.source.trim().slice(0, 80) || `${market}-buyer-enquiry`,
    pageUrl: enquiryPageUrl(context.pageUrl),
    company: (context.company || "").slice(0, 200),
    __top: Math.max(0, Number.isFinite(context.elapsedMs) ? context.elapsedMs : 0),
  }
}

/** Preserve the original UK payload contract for existing callers. */
export function buildUkBuyerInquiryPayload(values: UkBuyerInquiryValues, context: BuyerInquiryContext) {
  return buildBuyerInquiryPayload(values, context, "uk")
}

/** A honeypot 202 or a malformed response must not become a recorded conversion. */
export function confirmedUkBuyerDelivery(responseOk: boolean, body: unknown): boolean {
  if (!responseOk || !body || typeof body !== "object") return false
  const result = body as Record<string, unknown>
  return result.success === true && typeof result.requestId === "string" && result.requestId.trim().length > 0
}

export const UK_BUYER_DELIVERY_ERROR = "We could not confirm delivery. Your details are still here. Please try again, or email us directly."

export function buyerDeliveryError(market: BuyerMarket = "uk"): string {
  return market === "germany"
    ? "Die Zustellung konnte nicht bestätigt werden. Ihre Angaben sind weiterhin vorhanden. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt per E-Mail."
    : UK_BUYER_DELIVERY_ERROR
}
