import type { Metadata } from "next"
import Link from "next/link"
import AffordabilityForm from "./affordability-form"

export const metadata: Metadata = {
  title: "How Much Home Can I Afford? | Affordability Calculator | Crown Coastal Homes",
  description:
    "Find out how much home you can afford in California. Enter your income, debts, and savings to get a personalized home price estimate. Crown Coastal Homes.",
  openGraph: {
    title: "Affordability Calculator | Crown Coastal Homes",
    description: "How much home can I afford? Free affordability calculator for California home buyers.",
  },
  alternates: { canonical: "/affordability-calculator" },
}

export default function AffordabilityCalculatorPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] theme-transition pt-24 pb-16">
      <section className="coastal-section-light py-16 md:py-20 relative overflow-hidden theme-transition">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--coastal-text)] mb-6">
              How Much Home Can I Afford?
            </h1>
            <p className="text-xl text-[var(--coastal-muted-text)] mb-4">
              Enter your income, debts, and savings to find your comfortable home price range in California.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[var(--surface)] theme-transition">
        <div className="container mx-auto px-4">
          <AffordabilityForm />
        </div>
      </section>

      <section className="py-8 bg-[var(--surface)] theme-transition">
        <div className="container mx-auto px-4 max-w-3xl text-center space-y-2">
          <p className="text-sm text-[var(--coastal-muted-text)]">
            Need to estimate monthly payments for a specific home?{" "}
            <Link href="/mortgage-calculator" className="text-[var(--coastal-primary)] font-semibold hover:underline">
              Use our mortgage calculator
            </Link>
          </p>
          <p className="text-sm text-[var(--coastal-muted-text)]">
            Buying in California?{" "}
            <Link href="/closing-cost-estimator" className="text-[var(--coastal-primary)] font-semibold hover:underline">
              Estimate your closing costs
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
            Browse All Properties <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Affordability Calculator | Crown Coastal Homes",
            url: "https://crowncoastalhomes.com/affordability-calculator",
            publisher: { "@type": "Organization", name: "Crown Coastal Homes" },
          }),
        }}
      />
    </div>
  )
}
