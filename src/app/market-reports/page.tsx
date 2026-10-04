import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BarChart3, Database, MapPin, Search } from "lucide-react"

import { AgentContactCard } from "@/components/AgentContactCard"
import NewsletterInline from "@/components/blog/newsletter-inline"
import CRMLSDisclaimer from "@/components/crmls-disclaimer"
import { getCountyCities } from "@/lib/counties"
import { getCountyListingMetrics, type CityListingMetrics } from "@/lib/city-metrics"

export const metadata: Metadata = {
  title: "California Coastal Market Snapshot | Crown Coastal Homes",
  description:
    "Review current CRMLS listing counts and county-level median asking-price context across selected California coastal counties.",
  alternates: { canonical: "/market-reports" },
}

export const revalidate = 3600

const COUNTY_CONFIG = [
  { slug: "san-diego", name: "San Diego County", region: "Southern California" },
  { slug: "orange", name: "Orange County", region: "Southern California" },
  { slug: "los-angeles", name: "Los Angeles County", region: "Southern California" },
  { slug: "ventura", name: "Ventura County", region: "Central Coast" },
  { slug: "santa-barbara", name: "Santa Barbara County", region: "Central Coast" },
] as const

interface CountySnapshot {
  slug: string
  name: string
  region: string
  activeListings: number
  configuredCities: number
  medianPrice: number | null
  cityLinks: Array<{ city: string; slug: string }>
}

export default async function MarketReportsPage() {
  const countyMetrics: Array<{
    county: (typeof COUNTY_CONFIG)[number]
    metrics: CityListingMetrics
  }> = []
  for (const county of COUNTY_CONFIG) {
    countyMetrics.push({
      county,
      metrics: await getCountyListingMetrics(county.name),
    })
  }
  const snapshots = countyMetrics.map(({ county, metrics }) => buildSnapshot(county, metrics))
  const totalActiveListings = snapshots.reduce((sum, county) => sum + county.activeListings, 0)
  const totalLinkedCities = snapshots.reduce((sum, county) => sum + county.configuredCities, 0)

  return (
    <div className="min-h-screen bg-[var(--bg)] theme-transition">
      <section className="relative min-h-[560px] h-[70svh] max-h-[760px] flex items-center overflow-hidden">
        <Image
          src="/san-diego-bay-sunset.png"
          alt="San Diego Bay and coastal skyline"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[#0F2A44]/80" />
        <div className="relative z-10 w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-[#D7C39A] text-xs font-semibold uppercase tracking-widest mb-5">
              <Database className="h-4 w-4" aria-hidden />
              Current CRMLS Inventory Context
            </div>
            <h1 className="font-[var(--font-playfair)] text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
              California Coastal Market Snapshot
            </h1>
            <p className="text-base sm:text-xl text-white/85 leading-relaxed max-w-2xl mb-8">
              Current listing counts and county-level asking-price context across selected California counties. No
              simulated trends or projected returns.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
              <HeroMetric label="Active listings" value={totalActiveListings.toLocaleString()} />
              <HeroMetric label="Cities linked" value={totalLinkedCities.toLocaleString()} />
              <HeroMetric label="Counties covered" value={String(snapshots.length)} />
              <HeroMetric label="Source" value="CRMLS" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--coastal-border)] bg-[var(--surface)]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-sm text-[var(--coastal-muted-text)] max-w-3xl">
            Counts and medians represent currently available sale listings returned by the site&apos;s CRMLS-backed
            county metrics. They are asking-price context, not closed-sale statistics.
          </p>
          <Link
            href="/about/data-methodology"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--coastal-primary)] hover:underline whitespace-nowrap"
          >
            Data methodology
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 text-[var(--coastal-primary)] text-xs font-semibold uppercase tracking-widest mb-3">
                <BarChart3 className="h-4 w-4" aria-hidden />
                Selected Markets
              </div>
              <h2 className="font-[var(--font-playfair)] text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-3">
                County Inventory Overview
              </h2>
              <p className="text-[var(--coastal-muted-text)] max-w-2xl">
                Use these figures to choose where to research next. Verify every property and market assumption before
                making a purchase or sale decision.
              </p>
            </div>

            <div className="space-y-5">
              {snapshots.map((county) => (
                <article
                  key={county.slug}
                  id={county.slug}
                  className="bg-[var(--surface)] border border-[var(--coastal-border)] rounded-lg p-5 sm:p-7 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--coastal-muted-text)] mb-2">
                        <MapPin className="h-3.5 w-3.5" aria-hidden />
                        {county.region}
                      </div>
                      <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-[var(--coastal-text)]">
                        {county.name}
                      </h3>
                    </div>
                    <Link
                      href={`/discover/${county.slug}`}
                      className="inline-flex items-center gap-2 min-h-11 text-sm font-semibold text-[var(--coastal-primary)] hover:underline"
                    >
                      Explore county
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-y border-[var(--coastal-border)] py-5 mb-5">
                    <Metric label="Active listings" value={county.activeListings.toLocaleString()} />
                    <Metric label="Cities linked" value={county.configuredCities.toLocaleString()} />
                    <Metric label="Median asking price" value={formatCurrency(county.medianPrice)} />
                  </div>

                  <div className="grid md:grid-cols-[1fr_auto] gap-5 items-end">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--coastal-muted-text)] mb-2">
                        Popular city searches
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {county.cityLinks.length > 0 ? county.cityLinks.map((city) => (
                          <Link
                            key={city.slug}
                            href={`/buy/${county.slug}/${city.slug}`}
                            className="inline-flex items-center gap-1.5 min-h-10 px-3 py-2 rounded-full border border-[var(--coastal-border)] text-xs font-medium text-[var(--coastal-text)] hover:border-[var(--coastal-primary)]"
                          >
                            {city.city}
                          </Link>
                        )) : (
                          <span className="text-sm text-[var(--coastal-muted-text)]">No city pages configured.</span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-[var(--coastal-muted-text)] md:text-right">
                      <span className="block text-xs uppercase tracking-wider font-semibold mb-1">Data scope</span>
                      <span className="font-semibold text-[var(--coastal-text)]">Active sale listings</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <NewsletterInline source="market_reports" title="Get Market Updates" />

            <section className="bg-[var(--surface)] border border-[var(--coastal-border)] rounded-lg p-6">
              <h2 className="font-[var(--font-playfair)] text-xl font-bold text-[var(--coastal-text)] mb-4">
                How to Use This Snapshot
              </h2>
              <ol className="space-y-4 text-sm text-[var(--coastal-muted-text)]">
                <ResearchStep number="1" title="Choose a county" text="Start with current inventory and the cities returning listings." />
                <ResearchStep number="2" title="Open city data" text="Compare available homes and city-level price context." />
                <ResearchStep number="3" title="Check comparables" text="Review recent closed sales for the specific property type and area." />
                <ResearchStep number="4" title="Verify the property" text="Confirm condition, disclosures, title, insurance, financing, and local rules." />
              </ol>
            </section>

            <section className="bg-[var(--surface)] border border-[var(--coastal-border)] rounded-lg p-6">
              <Search className="h-6 w-6 text-[var(--coastal-primary)] mb-3" aria-hidden />
              <h2 className="font-[var(--font-playfair)] text-xl font-bold text-[var(--coastal-text)] mb-2">
                Need a Property-Specific Analysis?
              </h2>
              <p className="text-sm text-[var(--coastal-muted-text)] mb-4">
                A listing count cannot replace a property-level comparative market analysis.
              </p>
              <Link
                href="/contact?message=I%27d%20like%20a%20property-specific%20market%20analysis."
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--coastal-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"
              >
                Request an analysis
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </section>

            <AgentContactCard />
          </aside>
        </div>
      </section>

      <CRMLSDisclaimer compact />
    </div>
  )
}

function buildSnapshot(
  county: (typeof COUNTY_CONFIG)[number],
  metrics: CityListingMetrics,
): CountySnapshot {
  const configuredCities = getCountyCities(county.slug)

  return {
    ...county,
    activeListings: metrics.totalSales,
    configuredCities: configuredCities.length,
    medianPrice: metrics.medianSalePrice,
    cityLinks: configuredCities.slice(0, 5).map((city) => ({ city: city.name, slug: city.slug })),
  }
}

function formatCurrency(value: number | null): string {
  if (!value) return "N/A"
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2).replace(/\.00$/, "")}M`
  return `$${Math.round(value / 1_000)}K`
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-[92px] rounded-lg border border-white/20 bg-black/25 p-3 sm:p-4 backdrop-blur-sm">
      <div className="text-[10px] sm:text-xs uppercase tracking-wider text-white/60 mb-2">{label}</div>
      <div className="font-[var(--font-playfair)] text-xl sm:text-2xl font-bold text-white break-words">{value}</div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-[var(--coastal-muted-text)] mb-1">{label}</div>
      <div className="font-[var(--font-playfair)] text-xl sm:text-2xl font-bold text-[var(--coastal-text)] break-words">
        {value}
      </div>
    </div>
  )
}

function ResearchStep({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[var(--surface-muted)] font-semibold text-[var(--coastal-primary)]">
        {number}
      </span>
      <span>
        <strong className="block text-[var(--coastal-text)]">{title}</strong>
        {text}
      </span>
    </li>
  )
}
