import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ExternalLink, MapPin, MessageSquareQuote } from "lucide-react"
import { COUNTIES } from "@/lib/counties"
import CustomerReview from "@/components/customer-review"
import { absoluteUrl } from "@/lib/constants/site"
import { SITE_SCHEMA_IDS } from "@/lib/seo/site-schema"

export const metadata: Metadata = {
  title: "Client Testimonials | Crown Coastal Homes Reviews",
  description:
    "Read client testimonials and reviews for Crown Coastal Homes. Real estate experiences in San Diego, Los Angeles, Orange County, and California.",
  openGraph: { title: "Testimonials | Crown Coastal Homes", description: "Client testimonials and reviews for Crown Coastal Homes." },
  alternates: { canonical: "/testimonials" },
}

const KEY_COUNTIES = ["san-diego", "los-angeles", "orange", "san-francisco"]

export default function TestimonialsPage() {
  const counties = COUNTIES.filter((c) => KEY_COUNTIES.includes(c.slug))

  return (
    <div className="min-h-screen bg-[var(--bg)] theme-transition">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--coastal-primary)] pt-28 md:pt-36 pb-16 md:pb-24">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold text-white/90 mb-6 uppercase tracking-wide">
            <MessageSquareQuote className="h-3.5 w-3.5 text-[var(--coastal-secondary)]" />
            Client Testimonials
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 leading-tight">
            Client Experiences
            <span className="block" style={{ color: "var(--coastal-secondary)" }}>Across California</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Named client accounts of buying, selling, and working with Crown Coastal Homes.
          </p>
        </div>
      </section>

      {/* ── Source and context ───────────────────────────────── */}
      <section className="bg-[var(--surface)] border-b border-[var(--coastal-border)] theme-transition">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-[var(--coastal-text)]">Named client experiences</h2>
              <p className="mt-1 text-sm text-[var(--coastal-muted-text)]">
                Full testimonial text is shown without an invented aggregate score or review count.
              </p>
            </div>
            <a
              href="https://www.zillow.com/profile/RezaSoCal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--coastal-border)] px-4 text-sm font-semibold text-[var(--coastal-primary)] hover:bg-[var(--surface-muted)]"
            >
              View external profile <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Review cards ─────────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-[var(--bg)] theme-transition">
        <div className="container mx-auto px-4">
          <CustomerReview gridClassName="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 items-start" />
        </div>
      </section>

      {/* ── Explore markets ──────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-[var(--surface)] theme-transition">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 text-[var(--coastal-secondary)] text-sm font-semibold uppercase tracking-wider mb-3">
              <MapPin className="h-4 w-4" />
              Our Markets
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[var(--coastal-text)] mb-3 theme-transition">
              Explore Our Coverage
            </h2>
            <p className="text-[var(--coastal-muted-text)] max-w-xl mx-auto text-base">
              Crown Coastal Homes operates across California&apos;s most sought-after counties.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {counties.map((county) => (
              <div
                key={county.slug}
                className="group rounded-lg border border-[var(--coastal-border)] bg-[var(--bg)] p-6 shadow-soft transition-all duration-300 hover:border-[var(--coastal-primary)] hover:bg-[var(--coastal-primary)] hover:shadow-medium theme-transition"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[var(--coastal-text)] group-hover:text-white transition-colors duration-300">
                    <Link href={`/buy/${county.slug}`}>{county.name}</Link>
                  </h3>
                  <ArrowRight className="h-4 w-4 text-[var(--coastal-muted-text)] group-hover:text-[var(--coastal-secondary)] group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <ul className="space-y-1.5 mb-5">
                  {county.cities.slice(0, 5).map((city) => (
                    <li key={city.slug}>
                      <Link
                        href={`/buy/${county.slug}/${city.slug}`}
                        className="text-sm text-[var(--coastal-muted-text)] group-hover:text-white/70 hover:!text-white transition-colors duration-200"
                      >
                        {city.name}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/buy/${county.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--coastal-primary)] group-hover:text-[var(--coastal-secondary)] transition-colors duration-300"
                >
                  View all listings <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--coastal-primary)] py-16 md:py-20 theme-transition">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <MessageSquareQuote className="mx-auto mb-4 h-7 w-7 text-[var(--coastal-secondary)]" aria-hidden="true" />
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Ready to Write Your
            <span className="block" style={{ color: "var(--coastal-secondary)" }}>Success Story?</span>
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
            Tell us what you are planning, and speak directly with the team about the next practical step.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--coastal-secondary)] px-8 py-4 text-base font-bold text-[#083133] shadow-medium transition-all duration-300 hover:opacity-90"
            >
              Get in Touch <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/properties"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20"
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${absoluteUrl("/testimonials")}#webpage`,
        name: "Client Testimonials | Crown Coastal Homes",
        url: absoluteUrl("/testimonials"),
        isPartOf: { "@id": SITE_SCHEMA_IDS.website },
        publisher: { "@id": SITE_SCHEMA_IDS.organization },
      }) }} />
    </div>
  )
}
