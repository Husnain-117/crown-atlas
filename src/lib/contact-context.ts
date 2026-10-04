import { SITE_URL } from "./constants/site"

type QueryReader = { get(name: string): string | null }

function queryText(query: QueryReader, name: string, max: number): string {
  return (query.get(name) || "").replace(/[\r\n]+/g, " ").trim().slice(0, max)
}

export function safePropertyPageUrl(value: string): string {
  if (!value) return ""
  try {
    const url = new URL(value, SITE_URL)
    if (url.origin !== SITE_URL || !url.pathname.startsWith("/properties/")) return ""
    return `${SITE_URL}${url.pathname}`
  } catch {
    return ""
  }
}

/** Both old property= links and new listingKey= links retain the selected home. */
export function readContactContext(query: QueryReader) {
  const listingKey = queryText(query, "listingKey", 160) || queryText(query, "property", 160)
  const propertyAddress = queryText(query, "propertyAddress", 500)
  const propertyPageUrl = safePropertyPageUrl(queryText(query, "propertyPageUrl", 1000))
  const inquiry = queryText(query, "inquiry", 40)
  const suppliedMessage = (query.get("message") || "").trim().slice(0, 5000)
  const subject = [propertyAddress, listingKey ? `Listing ID: ${listingKey}` : ""].filter(Boolean).join(" · ")
  let message = suppliedMessage
  if (!message && inquiry === "valuation" && query.get("address")) {
    message = `I'd like a home valuation for: ${queryText(query, "address", 500)}`
  } else if (!message && subject) {
    message = inquiry === "financing"
      ? `I'd like to discuss financing options for ${subject}.`
      : `I'm interested in ${subject}. Please contact me to discuss this home${inquiry === "tour" ? " and arrange an in-person or virtual tour" : ""}.`
  } else if (!message && inquiry === "buying") {
    message = "I'd like to discuss buying a home in California and plan the next steps."
  }
  return { listingKey, propertyAddress, propertyPageUrl, inquiry, message, subject }
}

export function buildPropertyContactHref(context: {
  listingKey?: string | null
  propertyAddress?: string | null
  propertyPageUrl?: string | null
}): string {
  const params = new URLSearchParams({ inquiry: "tour" })
  if (context.listingKey) params.set("listingKey", context.listingKey)
  if (context.propertyAddress) params.set("propertyAddress", context.propertyAddress)
  const pageUrl = safePropertyPageUrl(context.propertyPageUrl || "")
  if (pageUrl) params.set("propertyPageUrl", pageUrl)
  return `/contact?${params}#contact-form`
}

export function isInternationalPhone(value?: string): boolean {
  if (!value?.trim()) return true
  return /^[+\d\s().-]+$/.test(value) && value.replace(/\D/g, "").length >= 7 && value.replace(/\D/g, "").length <= 15
}

export function isValidTimeZone(value: string): boolean {
  if (!value) return true
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format()
    return true
  } catch {
    return false
  }
}

export function todayInTimeZone(timeZone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now)
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type)?.value).join("-")
}

export function isValidTourDate(value: string, timeZone: string, now = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !timeZone || !isValidTimeZone(timeZone)) return false
  const date = new Date(`${value}T12:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= todayInTimeZone(timeZone, now)
}
