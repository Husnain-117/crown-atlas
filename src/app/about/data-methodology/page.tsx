import type { Metadata } from "next"
import Link from "next/link"
import { Calculator, Database, RefreshCw, ShieldCheck } from "lucide-react"

import { CONTACT } from "@/lib/constants/contact"
import { SITE_NAME, absoluteUrl } from "@/lib/constants/site"
import { SITE_SCHEMA_IDS } from "@/lib/seo/site-schema"

const LAST_REVIEWED = "2026-07-21"

export const metadata: Metadata = {
  title: "Listing Data Methodology | Crown Coastal Homes",
  description:
    "How Crown Coastal Homes sources, refreshes, calculates, and verifies California property listing and market information.",
  alternates: { canonical: "/about/data-methodology" },
  openGraph: {
    title: "Listing Data Methodology | Crown Coastal Homes",
    description:
      "Understand the sources, refresh schedule, calculations, and limitations behind Crown Coastal Homes property data.",
    url: "/about/data-methodology",
    type: "article",
  },
}

const methodologySections = [
  {
    title: "Listing source",
    icon: Database,
    body: (
      <>
        Property records are sourced from California Regional Multiple Listing Service (CRMLS) through the
        CoreLogic Trestle feed. Listing agents and brokers supply the underlying status, price, property facts,
        remarks, and media. Crown Coastal Homes does not independently create those source fields.
      </>
    ),
  },
  {
    title: "Refresh and cache timing",
    icon: RefreshCw,
    body: (
      <>
        Listing deltas are scheduled every five minutes and a full reconciliation is scheduled weekly. Cached
        pages may add up to one further hour of delay. When a specific feed timestamp is available, it is shown
        with the listing disclosure; otherwise the site does not invent an update time.
      </>
    ),
  },
  {
    title: "Calculated information",
    icon: Calculator,
    body: (
      <>
        Monthly payment, affordability, closing-cost, price-per-square-foot, and market summary figures are
        estimates derived from the inputs shown on the relevant page. They are informational only and are not
        appraisals, lending offers, tax advice, or guarantees of future value.
      </>
    ),
  },
  {
    title: "Verification and corrections",
    icon: ShieldCheck,
    body: (
      <>
        Buyers and renters should independently verify availability, measurements, permits, schools, HOA terms,
        taxes, and other material facts. To report a possible error, email{" "}
        <a className="font-semibold text-[var(--coastal-primary)] underline" href={CONTACT.email.href}>
          {CONTACT.email.display}
        </a>{" "}
        with the page URL and the field in question.
      </>
    ),
  },
]

export default function DataMethodologyPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${absoluteUrl("/about/data-methodology")}#webpage`,
    url: absoluteUrl("/about/data-methodology"),
    name: "Listing Data Methodology",
    description:
      "How Crown Coastal Homes sources, refreshes, calculates, and verifies California property information.",
    dateModified: LAST_REVIEWED,
    isPartOf: { "@id": SITE_SCHEMA_IDS.website },
    publisher: { "@id": SITE_SCHEMA_IDS.organization },
    about: {
      "@type": "Thing",
      name: "California real estate listing data methodology",
    },
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pb-20 pt-28 text-[var(--coastal-text)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="max-w-3xl border-b border-[var(--coastal-border)] pb-10">
          <p className="text-sm font-semibold uppercase text-[var(--coastal-primary)]">Data transparency</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">How Our Listing Data Works</h1>
          <p className="mt-5 text-lg leading-relaxed text-[var(--coastal-muted-text)]">
            This page explains which information comes from the MLS, what Crown Coastal Homes calculates, how
            often data is refreshed, and where human verification is still essential.
          </p>
          <p className="mt-4 text-sm text-[var(--coastal-muted-text)]">
            Last reviewed: <time dateTime={LAST_REVIEWED}>July 21, 2026</time>
          </p>
        </header>

        <div className="divide-y divide-[var(--coastal-border)]">
          {methodologySections.map(({ title, icon: Icon, body }) => (
            <section key={title} className="grid gap-4 py-9 sm:grid-cols-[44px_1fr]">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--surface-muted)] text-[var(--coastal-primary)]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{title}</h2>
                <p className="mt-3 leading-7 text-[var(--coastal-muted-text)]">{body}</p>
              </div>
            </section>
          ))}
        </div>

        <section className="border-t border-[var(--coastal-border)] pt-9">
          <h2 className="text-xl font-bold">Using and citing the data</h2>
          <p className="mt-3 leading-7 text-[var(--coastal-muted-text)]">
            Cite the canonical property or location page, not a search-results snapshot, and include the visible
            data timestamp when one is provided. Because active inventory changes, confirm time-sensitive facts
            before publishing or making a transaction decision.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/properties"
              className="inline-flex min-h-11 items-center rounded-lg bg-[var(--coastal-primary)] px-5 font-semibold text-white hover:opacity-90"
            >
              Browse current listings
            </Link>
            <Link
              href="/about/facts"
              className="inline-flex min-h-11 items-center rounded-lg border border-[var(--coastal-border)] px-5 font-semibold hover:bg-[var(--surface-muted)]"
            >
              View {SITE_NAME} facts
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
