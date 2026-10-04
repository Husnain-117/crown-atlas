/**
 * BreadcrumbNav — Dual-purpose breadcrumb component.
 *
 * Renders two things from a single `items` prop:
 *   1. Visible accessible breadcrumb navigation (<nav> with ARIA)
 *   2. BreadcrumbList JSON-LD (inline <script type="application/ld+json">)
 *
 * Google uses the JSON-LD for rich-result breadcrumbs in SERPs.
 * The visible HTML provides on-page UX and is the accessible fallback.
 *
 * Usage (Server Component — no 'use client' required):
 *   <BreadcrumbNav
 *     items={[
 *       { name: 'Home',            href: '/' },
 *       { name: 'California',      href: '/buy' },
 *       { name: 'San Diego County' },        // no href = current page
 *     ]}
 *   />
 */

import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  /** Display label shown in the nav and in Google SERPs */
  name: string
  /**
   * Canonical href for this crumb.
   * Omit for the final (current-page) crumb — it will be rendered as text
   * with aria-current="page" and excluded from the schema `item` property.
   */
  href?: string
}

interface Props {
  items: BreadcrumbItem[]
  /**
   * Extra Tailwind / CSS classes applied to the outer <nav> wrapper.
   * Defaults to the standard section gutter so it aligns with page sections.
   */
  className?: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** Always use the production origin in structured-data URLs */
const PRODUCTION_ORIGIN = 'https://crowncoastalhomes.com'

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * BreadcrumbNav
 *
 * Server component — safe to place in any layout or async page component.
 * No client-side JS is shipped by this component.
 */
export default function BreadcrumbNav({ items, className }: Props) {
  if (!items || items.length === 0) return null

  // ── JSON-LD schema ──────────────────────────────────────────────────────
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, index) => {
      const entry: Record<string, unknown> = {
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
      }
      // Google requires `item` only when a URL is available
      if (crumb.href) {
        entry.item = crumb.href.startsWith('http')
          ? crumb.href
          : `${PRODUCTION_ORIGIN}${crumb.href}`
      }
      return entry
    }),
  }

  // ── Visible breadcrumb nav ──────────────────────────────────────────────
  return (
    <>
      {/* Inline JSON-LD — placed before the <nav> so crawlers find it first */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <nav
        aria-label="Breadcrumb"
        className={
          className ??
          'max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-3 md:mt-4'
        }
      >
        <ol
          className="flex items-center flex-wrap gap-x-1.5 gap-y-1 text-sm text-[var(--coastal-muted-text)]"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          {items.map((crumb, index) => {
            const isLast = index === items.length - 1

            return (
              <li
                key={`${crumb.name}-${index}`}
                className="flex items-center gap-x-1.5"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {/* Separator — hidden from screen readers */}
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="select-none opacity-40 text-xs"
                  >
                    /
                  </span>
                )}

                {/* Current page — plain text, no link */}
                {isLast || !crumb.href ? (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className={
                      isLast
                        ? 'font-medium text-[var(--coastal-text)]'
                        : 'text-[var(--coastal-muted-text)]'
                    }
                    itemProp="name"
                  >
                    {crumb.name}
                  </span>
                ) : (
                  /* Ancestor crumb — clickable link */
                  <Link
                    href={crumb.href}
                    className="hover:text-[var(--coastal-primary)] transition-colors duration-150"
                    itemProp="item"
                  >
                    <span itemProp="name">{crumb.name}</span>
                  </Link>
                )}

                {/* Hidden position meta for microdata fallback */}
                <meta itemProp="position" content={String(index + 1)} />
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
