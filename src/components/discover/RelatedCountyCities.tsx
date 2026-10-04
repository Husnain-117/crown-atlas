/**
 * RelatedCountyCities
 *
 * A dense internal-linking section rendered at the bottom of every county
 * discovery page. It outputs two groups of link pills:
 *
 *   1. "Cities in [County]" — links to the buy landing for each city within
 *      the current county (deep‑links into the MLS listing layer).
 *
 *   2. "Explore Other California Counties" — links to the discover page of
 *      a curated set of neighbouring / high-traffic counties, pruned so the
 *      current county is never shown in its own section.
 *
 * Why this matters for SEO
 * ─────────────────────────
 * Google's crawl budget is finite. Dense, topically-related internal links
 * help Googlebot efficiently discover and index all city-level pages, and
 * they distribute PageRank from the higher-authority county pages down to
 * the individual city buy/rent pages.
 *
 * The component is a pure server component — zero client JS emitted.
 */

import Link from 'next/link'
import { COUNTIES, type CountyConfig } from '@/lib/counties'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  /** The county whose discovery page this section is embedded in */
  county: CountyConfig
}

// ─── Data: neighbouring / high-traffic counties to feature ───────────────────

/**
 * Ordered list of "other county" suggestions shown in the discover-more grid.
 * We curate this by hand so we always show the highest-traffic counties first.
 * The current county is filtered out at render time.
 */
const FEATURED_COUNTY_SLUGS: string[] = [
  'san-diego',
  'los-angeles',
  'orange',
  'riverside',
  'san-bernardino',
  'santa-clara',
  'alameda',
  'contra-costa',
  'sacramento',
  'san-mateo',
  'san-francisco',
  'ventura',
  'fresno',
  'kern',
  'santa-barbara',
  'monterey',
  'san-luis-obispo',
  'napa',
  'sonoma',
  'marin',
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function RelatedCountyCities({ county }: Props) {
  // ── 1. Cities in this county ──────────────────────────────────────────────
  // Link to the /buy/[countySlug]/[citySlug] deep-link so users land directly
  // on filtered for-sale listings — not just a discovery page.
  const cityLinks = county.cities.map((city) => ({
    label: city.name,
    href: `/buy/${county.slug}/${city.slug}`,
  }))

  // ── 2. Other counties (curated, exclude self) ─────────────────────────────
  const countyLookup = new Map(COUNTIES.map((c) => [c.slug, c]))
  const otherCounties = FEATURED_COUNTY_SLUGS
    .filter((slug) => slug !== county.slug)
    .slice(0, 12) // Never show more than 12 — keeps the block scannable
    .map((slug) => {
      const c = countyLookup.get(slug)
      return c ? { label: c.name, href: `/discover/${c.slug}` } : null
    })
    .filter(Boolean) as Array<{ label: string; href: string }>

  // Skip the entire block if there's nothing to show
  if (cityLinks.length === 0 && otherCounties.length === 0) return null

  return (
    <section
      aria-label={`Related cities and counties for ${county.name}`}
      className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-16 md:mt-20 mb-4"
    >
      <div className="bg-[var(--surface)] border border-[var(--coastal-border)] rounded-2xl p-6 md:p-8">

        {/* ── Cities in this county ────────────────────────────────────── */}
        {cityLinks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-[var(--coastal-text)] mb-4">
              Browse Homes in {county.name}
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {cityLinks.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="
                    px-4 py-2 rounded-full text-sm font-medium
                    bg-[var(--surface-muted)] border border-[var(--coastal-border)]
                    text-[var(--coastal-text)]
                    hover:border-[var(--coastal-primary)] hover:text-[var(--coastal-primary)]
                    transition-colors duration-150
                  "
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Other California counties ─────────────────────────────────── */}
        {otherCounties.length > 0 && (
          <div className={cityLinks.length > 0 ? 'pt-6 border-t border-[var(--coastal-border)]' : ''}>
            <h2 className="text-lg font-bold text-[var(--coastal-text)] mb-4">
              Explore Other California Counties
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {otherCounties.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="
                    px-4 py-2 rounded-full text-sm font-medium
                    bg-[var(--surface-muted)] border border-[var(--coastal-border)]
                    text-[var(--coastal-text)]
                    hover:border-[var(--coastal-secondary)] hover:text-[var(--coastal-secondary)]
                    transition-colors duration-150
                  "
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
