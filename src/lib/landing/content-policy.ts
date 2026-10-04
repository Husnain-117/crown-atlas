import type { LandingPageContent } from "@/ai/landing"
import { hasPlaceholderPlaceText, isPlaceholderPlace } from "./place-quality"

const DISALLOWED_PUBLICATION_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  { label: "school ranking claim", pattern: /\b(?:top|highly)[ -]?rated schools?\b|\bexcellent schools?\b|\bbest schools?\b/i },
  { label: "safety claim", pattern: /\b(?:safe|safest|low-crime) (?:street|area|community|neighborhood)s?\b/i },
  { label: "demographic steering", pattern: /\bfamily[ -]?friendly\b|\bideal for families\b|\bperfect for families\b|\bbest for (?:families|retirees|students|young professionals)\b/i },
  { label: "unverified inventory access", pattern: /\boff-market (?:listing|opportunit|access)|\bexclusive (?:listing|property) access\b/i },
  { label: "unverified service speed", pattern: /\binstant (?:property|listing) alerts?\b|\bsame-day (?:tour|showing)s?\b|\bwithin \d+ hours?\b/i },
  { label: "outcome guarantee", pattern: /\bguaranteed? (?:return|appreciation|outcome|sale|offer|response|result)s?\b/i },
  { label: "fabricated performance", pattern: /\b\d+(?:\.\d+)?%\s+(?:annual )?(?:appreciation|return|roi|occupancy)\b/i },
  { label: "unverified deal claim", pattern: /\bbest (?:deal|investment|long-term value)s?\b|\bwithout overpaying\b/i },
  { label: "active content markup", pattern: /<(?:script|iframe|object|embed|style)\b/i },
  { label: "generic doorway introduction", pattern: /\bwelcome to (?:beautiful|sunny|vibrant|charming|stunning)\b/i },
  { label: "generic destination filler", pattern: /\bnestled in the heart of\b|\bhas something for everyone\b/i },
]

function collectStrings(value: unknown, result: string[] = []): string[] {
  if (typeof value === "string") {
    result.push(value)
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, result))
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectStrings(item, result))
  }
  return result
}

function isSafeInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//") && !href.includes("\\")
}

export function validateLandingContentForPublication(
  content: LandingPageContent,
  expectedCanonicalPath: string
): { ok: true } | { ok: false; reasons: string[] } {
  const reasons = new Set<string>()

  if (content.seo.canonical_path !== expectedCanonicalPath) {
    reasons.add("canonical path does not match the requested page")
  }

  if (!content.intro.last_updated_line?.trim()) {
    reasons.add("content has no visible update date")
  }

  for (const text of collectStrings(content)) {
    if (hasPlaceholderPlaceText(text)) reasons.add("MLS placeholder used as editorial content")
    for (const rule of DISALLOWED_PUBLICATION_PATTERNS) {
      if (rule.pattern.test(text)) reasons.add(rule.label)
    }
  }

  for (const card of content.sections.neighborhoods.cards) {
    if (isPlaceholderPlace(card.name)) reasons.add("MLS placeholder used as a neighborhood")
  }

  const hrefs = [
    content.sections.buyer_strategy.cta.button_href,
    ...content.sections.neighborhoods.cards.map((card) => card.internal_link_href),
    ...content.internal_linking.in_body_links.map((link) => link.href),
    ...content.internal_linking.related_pages.map((link) => link.href),
    ...content.internal_linking.more_in_city.map((link) => link.href),
    ...content.internal_linking.nearby_cities.map((link) => link.href),
  ].filter((href): href is string => Boolean(href))

  if (hrefs.some((href) => !isSafeInternalHref(href))) {
    reasons.add("content contains a non-internal link")
  }

  return reasons.size === 0 ? { ok: true } : { ok: false, reasons: [...reasons] }
}
