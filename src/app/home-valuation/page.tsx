import type { Metadata } from "next"
import Link from "next/link"
import { COUNTIES } from "@/lib/counties"
import HomeValuationForm from "./home-valuation-form"

export const metadata: Metadata = {
  title: "What's My Home Worth? | Home Value Review | Crown Coastal Homes",
  description:
    "Request a comparative market analysis for a California property using available market data and property-specific details.",
  openGraph: {
    title: "What's My Home Worth? | Home Value Review | Crown Coastal Homes",
    description: "Request a comparative market analysis for a California property from Crown Coastal Homes.",
  },
  alternates: { canonical: "/home-valuation" },
}

const KEY_COUNTIES = ["san-diego", "los-angeles", "orange-county", "san-francisco"]

export default function HomeValuationPage() {
  const counties = COUNTIES.filter((c) => KEY_COUNTIES.includes(c.slug))

  return (
    <div className="min-h-screen bg-[var(--bg)] theme-transition">
      <section className="coastal-section-light pt-10 pb-16 md:pt-12 md:pb-20 relative overflow-hidden theme-transition">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--coastal-text)] mb-6">
              What&apos;s My Home Worth?
            </h1>
            <p className="text-xl text-[var(--coastal-muted-text)] mb-8">
              Request a property-specific market review using relevant comparable sales, active competition, and current listing data.
            </p>
          </div>
        </div>
      </section>

      <section id="valuation-form" className="py-12 md:py-16 bg-[var(--surface)] theme-transition scroll-mt-24">
        <div className="container mx-auto px-4">
          <HomeValuationForm />
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[var(--bg)] theme-transition">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-display font-bold text-[var(--coastal-text)] mb-8 text-center">
            Explore Markets by County & City
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {counties.map((county) => (
              <div key={county.slug} className="glass-card rounded-2xl p-6 border border-[var(--coastal-border)]">
                <h3 className="text-lg font-semibold text-[var(--coastal-text)] mb-4">
                  <Link href={`/buy/${county.slug}`} className="hover:text-[var(--coastal-primary)]">
                    {county.name}
                  </Link>
                </h3>
                <ul className="space-y-2">
                  {county.cities.slice(0, 6).map((city) => (
                    <li key={city.slug}>
                      <Link
                        href={`/buy/${county.slug}/${city.slug}`}
                        className="text-[var(--coastal-muted-text)] hover:text-[var(--coastal-primary)]"
                      >
                        {city.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/home-valuation#valuation-form"
                  className="inline-block mt-4 text-[var(--coastal-primary)] font-semibold"
                >
                  Request a market analysis for {county.name} &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-[var(--surface)] theme-transition">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--coastal-primary)] text-white rounded-xl font-semibold hover:opacity-90"
          >
            Contact Us
            <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "What's My Home Worth? | Home Value Review | Crown Coastal Homes",
            description: "Request a comparative market analysis for a California property using available market and property data.",
            url: "https://crowncoastalhomes.com/home-valuation",
            publisher: { "@type": "Organization", name: "Crown Coastal Homes" },
          }).replace(/</g, "\\u003c"),
        }}
      />
    </div>
  )
}
