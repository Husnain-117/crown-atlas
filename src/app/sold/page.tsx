import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BarChart3, Calculator, Search } from "lucide-react"

export const metadata: Metadata = {
  title: "Recent Sales & Comparable Market Analysis | Crown Coastal Homes",
  description:
    "Learn how recent comparable sales inform a California home purchase or sale, and request a property-specific comparative market analysis.",
  openGraph: {
    title: "Recent Sales & Comparable Market Analysis | Crown Coastal Homes",
    description: "Use relevant recent sales and active competition to make a more informed real estate decision.",
  },
  alternates: { canonical: "/sold" },
}

const researchPaths = [
  {
    title: "Request a property review",
    description: "Ask for a comparative market analysis based on the property, relevant recent sales, and active competition.",
    href: "/home-valuation",
    label: "Request a CMA",
    icon: Calculator,
  },
  {
    title: "Review current market data",
    description: "Compare current listing inventory and published county-level market snapshots before setting expectations.",
    href: "/market-reports",
    label: "View market reports",
    icon: BarChart3,
  },
  {
    title: "Compare active listings",
    description: "Search current CRMLS listings by location, price, property type, size, and other property characteristics.",
    href: "/properties",
    label: "Search active listings",
    icon: Search,
  },
]

export default function SoldPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Recent Sales and Comparable Market Analysis",
    description: "Guidance on using recent comparable sales in a California real estate decision.",
    url: "https://crowncoastalhomes.com/sold",
    isPartOf: {
      "@type": "WebSite",
      name: "Crown Coastal Homes",
      url: "https://crowncoastalhomes.com",
    },
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--coastal-text)]">
      <section className="coastal-section-light px-4 py-14 sm:py-16 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase text-[var(--coastal-primary)]">
            Comparable market research
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Recent Sales &amp; Comparable Market Analysis
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-[var(--coastal-muted-text)] sm:text-lg">
            A useful comparison considers recent nearby sales alongside current competition, property condition,
            location, size, and features. Request a property-specific review instead of relying on a generic estimate.
          </p>
        </div>
      </section>

      <section className="bg-[var(--surface)] px-4 py-12 md:py-16" aria-labelledby="research-options">
        <div className="mx-auto max-w-6xl">
          <h2 id="research-options" className="text-center font-display text-2xl font-bold sm:text-3xl">
            Choose the right starting point
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {researchPaths.map((item) => {
              const Icon = item.icon
              return (
                <article key={item.href} className="flex flex-col rounded-lg border border-[var(--coastal-border)] bg-[var(--bg)] p-6">
                  <Icon className="h-7 w-7 text-[var(--coastal-primary)]" aria-hidden />
                  <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 flex-1 leading-relaxed text-[var(--coastal-muted-text)]">{item.description}</p>
                  <Link href={item.href} className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-[var(--coastal-primary)] hover:underline">
                    {item.label}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">How comparable sales are evaluated</h2>
          <div className="mt-5 space-y-4 leading-relaxed text-[var(--coastal-muted-text)]">
            <p>
              The most relevant comparisons are generally similar in property type, location, size, condition,
              features, and timing. A single nearby sale may not reflect meaningful differences between properties.
            </p>
            <p>
              Listing and sales data can change or contain errors. Confirm material facts with source documents,
              inspections, disclosures, the relevant professionals, and the listing broker before making a decision.
            </p>
          </div>
          <Link
            href="/about/data-methodology"
            className="mt-6 inline-flex min-h-11 items-center gap-2 font-semibold text-[var(--coastal-primary)] hover:underline"
          >
            Read the data methodology
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
    </main>
  )
}
