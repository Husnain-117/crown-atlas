import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import OpenHouseCalendar from "@/components/open-house-calendar"
import { COUNTIES } from "@/lib/counties"

export const metadata: Metadata = {
  title: "Upcoming Open Houses in California | Crown Coastal Homes",
  description:
    "Review upcoming California open-house times when provided in current listing data, and verify the schedule before traveling.",
  openGraph: {
    title: "Upcoming Open Houses in California | Crown Coastal Homes",
    description: "Review upcoming open-house times from current California listing data.",
  },
  alternates: { canonical: "/open-homes" },
}

const KEY_COUNTIES = ["san-diego", "los-angeles", "orange", "san-francisco"]

export default function OpenHomesPage() {
  const counties = COUNTIES.filter((county) => KEY_COUNTIES.includes(county.slug))
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Upcoming Open Houses in California",
    description: "Upcoming open-house times provided in current California listing data.",
    url: "https://crowncoastalhomes.com/open-homes",
    isPartOf: {
      "@type": "WebSite",
      name: "Crown Coastal Homes",
      url: "https://crowncoastalhomes.com",
    },
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] pb-16 text-[var(--coastal-text)]">
      <section className="coastal-section-light px-4 py-14 sm:py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">Upcoming Open Houses</h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-[var(--coastal-muted-text)] sm:text-lg">
            Review future open-house times included in current listing data. Dates and access instructions can change, so confirm them before traveling.
          </p>
        </div>
      </section>

      <section id="upcoming-open-homes" className="scroll-mt-24 bg-[var(--surface)] px-4 py-12 md:py-16" aria-labelledby="schedule-heading">
        <div className="mx-auto max-w-[1440px]">
          <h2 id="schedule-heading" className="text-center font-display text-2xl font-bold sm:text-3xl">
            Current Schedule
          </h2>
          <p className="mx-auto mb-8 mt-3 max-w-xl text-center text-sm leading-relaxed text-[var(--coastal-muted-text)]">
            All dates and times are California local time (Pacific Time). Confirm the schedule before your visit.
          </p>
          <OpenHouseCalendar />
        </div>
      </section>

      <section className="px-4 py-12 md:py-16" aria-labelledby="county-heading">
        <div className="mx-auto max-w-5xl">
          <h2 id="county-heading" className="text-center font-display text-2xl font-bold sm:text-3xl">
            Browse Active Listings by County
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {counties.map((county) => (
              <article key={county.slug} className="rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] p-6">
                <h3 className="text-lg font-semibold">{county.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--coastal-muted-text)]">
                  Search active properties and request a tour for a specific listing.
                </p>
                <Link href={`/buy/${county.slug}`} className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-[var(--coastal-primary)] hover:underline">
                  View {county.name} listings
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
    </main>
  )
}
