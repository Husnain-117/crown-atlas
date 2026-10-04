import type { Metadata } from "next"
import Link from "next/link"
import { COUNTIES } from "@/lib/counties"
import { FAQSchema } from "@/components/FAQSchema"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// FAQ page rarely changes — revalidate once per day.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "FAQ | Frequently Asked Questions | Crown Coastal Homes",
  description:
    "Frequently asked questions about buying, selling, and renting in California. Crown Coastal Homes answers common questions about real estate in San Diego, LA, Orange County, and more.",
  openGraph: { title: "FAQ | Crown Coastal Homes", description: "Frequently asked questions about California real estate." },
  alternates: { canonical: "/faq" },
}

const KEY_COUNTIES = ["san-diego", "los-angeles", "orange-county", "san-francisco"]

export default function FAQPage() {
  const counties = COUNTIES.filter((c) => KEY_COUNTIES.includes(c.slug))
  const faqSchemaItems = [
    { question: "How do I find homes for sale?", answer: "Use our property search, map, or browse by county and city. You can filter by price, beds, baths, and property type." },
    { question: "What's my home worth?", answer: "Visit our home valuation page to request a free estimate. We use local comparable sales and market data." },
    { question: "How do I buy a home in California?", answer: "Buying a home in California involves 6 steps: get pre-approved, find an agent, search for homes, make an offer, complete escrow, and close. Crown Coastal guides buyers through every step." },
    { question: "What are closing costs for a buyer in California?", answer: "Closing costs for buyers in California are usually 2% to 5% of purchase price and include lender, escrow, title, and prepaid tax/insurance items." },
    { question: "Do I need a buyer's agent in California?", answer: "You are not legally required to use a buyer's agent, but an experienced local agent helps with pricing strategy, negotiations, disclosures, and contract timelines." },
    { question: "What is the average home price in San Diego / Orange County / Los Angeles?", answer: "Average and median prices change monthly by city and neighborhood. Crown Coastal updates market data frequently so buyers can track current pricing in each area." },
    { question: "How long does escrow take in California?", answer: "Most California escrows close in about 30 to 45 days, depending on financing, inspections, negotiations, and appraisal timelines." },
    { question: "What is a seller's disclosure in California?", answer: "A seller's disclosure is the set of forms where a seller reports known material facts, defects, and hazards about the property before closing." },
    { question: "How do I get pre-approved for a mortgage in California?", answer: "Choose a lender, submit income and asset documents, complete a credit check, and receive a pre-approval letter that defines your buying budget." },
    { question: "What is the difference between list price and sale price?", answer: "List price is the seller's asking price at marketing launch; sale price is the final negotiated amount recorded at closing." },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)] theme-transition pt-24 pb-16">
      <section className="coastal-section-light py-16 md:py-20 relative overflow-hidden theme-transition">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--coastal-text)] mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-[var(--coastal-muted-text)] mb-8">
              Common questions about buying, selling, and renting with Crown Coastal Homes in California.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[var(--surface)] theme-transition">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-[var(--coastal-muted-text)] theme-transition">
            <Accordion type="single" collapsible className="w-full">
              {faqSchemaItems.map((item, idx) => (
                <AccordionItem
                  key={`${item.question}-${idx}`}
                  value={`faq-${idx}`}
                  className="border-[var(--coastal-border)]"
                >
                  <AccordionTrigger
                    className="text-[var(--coastal-text)] font-semibold [&>svg]:hidden [&[data-state=open]_span[data-icon='plus']]:hidden [&[data-state=open]_span[data-icon='minus']]:inline-flex [&[data-state=closed]_span[data-icon='minus']]:hidden"
                  >
                    <span className="flex-1 text-left">{item.question}</span>
                    <span className="ml-3 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--coastal-border)]">
                      <span data-icon="plus" className="inline-flex text-[var(--coastal-primary)] font-bold text-base leading-none">
                        +
                      </span>
                      <span data-icon="minus" className="hidden text-[var(--coastal-primary)] font-bold text-base leading-none">
                        -
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-[var(--coastal-muted-text)]">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[var(--bg)] theme-transition">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-display font-bold text-[var(--coastal-text)] mb-8 text-center">Explore by County & City</h2>
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
                <Link href={`/buy/${county.slug}`} className="inline-block mt-4 text-[var(--coastal-primary)] font-semibold">View {county.name} →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-[var(--surface)] theme-transition">
        <div className="container mx-auto px-4 text-center">
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--coastal-primary)] text-white rounded-xl font-semibold hover:opacity-90">Contact Us <span aria-hidden>→</span></Link>
        </div>
      </section>

      <FAQSchema items={faqSchemaItems} />
    </div>
  )
}
