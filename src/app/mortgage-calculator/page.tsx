import type { Metadata } from "next"
import Link from "next/link"
import { COUNTIES } from "@/lib/counties"
import MortgageCalculatorForm from "./mortgage-calculator-form"

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Mortgage Calculator | Estimate Monthly Payments | Crown Coastal Homes",
  description:
    "Use our free mortgage calculator to estimate monthly payments for California homes. Calculate principal, interest, taxes, insurance, and PMI. Crown Coastal Homes.",
  openGraph: { title: "Mortgage Calculator | Crown Coastal Homes", description: "Free mortgage calculator for California home buyers." },
  alternates: { canonical: "/mortgage-calculator" },
}

const KEY_COUNTIES = ["san-diego", "los-angeles", "orange-county", "san-francisco"]

export default function MortgageCalculatorPage() {
  const counties = COUNTIES.filter((c) => KEY_COUNTIES.includes(c.slug))

  return (
    <div className="min-h-screen bg-[var(--bg)] theme-transition pt-24 pb-16">
      <section className="coastal-section-light py-16 md:py-20 relative overflow-hidden theme-transition">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--coastal-text)] mb-6">
              Mortgage Calculator
            </h1>
            <details className="max-w-2xl mx-auto" open={false}>
              <summary className="cursor-pointer text-xl text-[var(--coastal-muted-text)] mb-4 select-none">
                What&apos;s included in the estimate?
              </summary>
              <p className="text-sm md:text-base text-[var(--coastal-muted-text)] mt-2 mb-4">
                Your estimate includes taxes, insurance, and PMI (when applicable).
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[var(--surface)] theme-transition">
        <div className="container mx-auto px-4">
          <MortgageCalculatorForm />
        </div>
      </section>

      <section className="py-8 bg-[var(--surface)] theme-transition">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <p className="text-sm text-[var(--coastal-muted-text)]">
            Looking to understand your budget?{" "}
            <Link href="/affordability-calculator" className="text-[var(--coastal-primary)] font-semibold hover:underline">
              Try our affordability calculator
            </Link>{" "}
            or{" "}
            <Link href="/closing-cost-estimator" className="text-[var(--coastal-primary)] font-semibold hover:underline">
              estimate your closing costs
            </Link>.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[var(--bg)] theme-transition">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-display font-bold text-[var(--coastal-text)] mb-8 text-center">Explore Homes by County & City</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {counties.map((county) => (
              <div key={county.slug} className="glass-card rounded-2xl p-6 border border-[var(--coastal-border)]">
                <h3 className="text-lg font-semibold text-[var(--coastal-text)] mb-4">
                  <Link href={`/buy/${county.slug}`} className="hover:text-[var(--coastal-primary)]">{county.name}</Link>
                </h3>
                <ul className="space-y-2">
                  {county.cities.slice(0, 6).map((city) => (
                    <li key={city.slug}>
                      <Link href={`/buy/${county.slug}/${city.slug}`} className="text-[var(--coastal-muted-text)] hover:text-[var(--coastal-primary)]">{city.name}</Link>
                    </li>
                  ))}
                </ul>
                <Link href={`/buy/${county.slug}`} className="inline-block mt-4 text-[var(--coastal-primary)] font-semibold">View {county.name} homes &rarr;</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-[var(--surface)] theme-transition">
        <div className="container mx-auto px-4 text-center">
          <Link href="/properties" className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--coastal-primary)] text-white rounded-xl font-semibold hover:opacity-90">Search Properties <span aria-hidden>&rarr;</span></Link>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: "Mortgage Calculator | Crown Coastal Homes", url: "https://crowncoastalhomes.com/mortgage-calculator", publisher: { "@type": "Organization", name: "Crown Coastal Homes" } }) }} />
    </div>
  )
}
