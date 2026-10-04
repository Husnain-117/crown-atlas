import { escapeContactHtml, singleLineContactText } from "@/lib/contact-inquiry"

export interface InquiryPropertyContext {
  listingKey?: string | null
  propertyAddress?: string | null
  pageUrl?: string | null
}

export function propertyInquirySummary(context: InquiryPropertyContext): string {
  const address = cleanSingleLine(context.propertyAddress)
  const listingKey = cleanSingleLine(context.listingKey)

  if (address && listingKey) return `${address} (Listing ID: ${listingKey})`
  if (address) return address
  if (listingKey) return `Listing ID: ${listingKey}`
  return ""
}

export function buildInquirySubject({
  kind,
  name,
  context,
}: {
  kind: string
  name?: string | null
  context?: InquiryPropertyContext
}): string {
  const safeKind = cleanSingleLine(kind) || "Website inquiry"
  const safeName = cleanSingleLine(name)
  const property = context ? propertyInquirySummary(context) : ""

  if (property && safeName) return `${safeKind}: ${property} - ${safeName}`
  if (property) return `${safeKind}: ${property}`
  if (safeName) return `${safeKind} from ${safeName}`
  return safeKind
}

export function buildPropertyContextHtml(context: InquiryPropertyContext): string {
  const address = cleanSingleLine(context.propertyAddress) || "Not provided"
  const listingKey = cleanSingleLine(context.listingKey) || "Not provided"
  const pageUrl = safeHttpUrl(context.pageUrl)

  return `
    <h3>Property Context</h3>
    <p><strong>Property:</strong> ${escapeContactHtml(address)}</p>
    <p><strong>Listing ID:</strong> ${escapeContactHtml(listingKey)}</p>
    <p><strong>Property page:</strong> ${pageUrl
      ? `<a href="${escapeContactHtml(pageUrl)}">${escapeContactHtml(pageUrl)}</a>`
      : "Not provided"}</p>
  `
}

export function safeHttpUrl(value?: string | null): string {
  if (!value) return ""

  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : ""
  } catch {
    return ""
  }
}

function cleanSingleLine(value?: string | null): string {
  return value ? singleLineContactText(value).trim() : ""
}
