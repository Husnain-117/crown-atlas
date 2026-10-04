import type { Metadata } from "next"
import Link from "next/link"
import ClosingCostForm from "./closing-cost-form"

export const metadata: Metadata = {
  title: "Closing Cost Estimator – California | Crown Coastal Homes",
  description:
    "Estimate your closing costs for buying a home in California. See a breakdown by county including title, escrow, transfer tax, and more. Crown Coastal Homes.",
  openGraph: {
    title: "Closing Cost Estimator | Crown Coastal Homes",
    description: "Free closing cost estimator for California home buyers by county.",
  },
  alternates: { canonical: "/closing-cost-estimator" },
}

export default function ClosingCostEstimatorPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] theme-transition pt-24 pb-16">
      <section className="coastal-section-light py-16 md:py-20 relative overflow-hidden theme-transition">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--coastal-text)] mb-6">
              Closing Cost Estimator
            </h1>
            <p className="text-xl text-[var(--coastal-muted-text)] mb-4">
              Estimate the closing costs for your California home purchase, broken down by county.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[var(--surface)] theme-transition">
        <div className="container mx-auto px-4">
          <ClosingCostForm />
        </div>
      </section>

      <section className="py-8 bg-[var(--surface)] theme-transition">
        <div className="container mx-auto px-4 max-w-3xl text-center space-y-2">
          <p className="text-sm text-[var(--coastal-muted-text)]">
            Want to estimate monthly payments?{" "}
            <Link href="/mortgage-calculator" className="text-[var(--coastal-primary)] font-semibold hover:underline">
              Use our mortgage calculator
            </Link>
          </p>
          <p className="text-sm text-[var(--coastal-muted-text)]">
            Not sure how much you can spend?{" "}
            <Link href="/affordability-calculator" className="text-[var(--coastal-primary)] font-semibold hover:underline">
              Check your affordability
            </Link>
          </p>
        </div>
      </section>

      <section className="py-12 bg-[var(--bg)] theme-transition">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--coastal-primary)] text-white rounded-xl font-semibold hover:opacity-90"
          >
            Browse Properties <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Closing Cost Estimator | Crown Coastal Homes",
            url: "https://crowncoastalhomes.com/closing-cost-estimator",
            publisher: { "@type": "Organization", name: "Crown Coastal Homes" },
          }),
        }}
      />
    </div>
  )
}
