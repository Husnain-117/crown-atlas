import type { Metadata } from "next"
import Link from "next/link"
import { Building2, FileText, Home, MapPinned, Search, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Sitemap | Crown Coastal Homes",
  description: "Browse Crown Coastal Homes property searches, market pages, services, company information, and buyer and seller resources.",
  alternates: { canonical: "/site-map" },
}

const groups = [
  {
    title: "Property Search",
    icon: Search,
    links: [
      ["All properties", "/properties"],
      ["Homes for sale", "/buy/houses"],
      ["Condos for sale", "/buy/condos"],
      ["Homes for rent", "/rent/houses"],
      ["Condos for rent", "/rent/condos"],
      ["New listings", "/new-listings"],
      ["New construction", "/new-construction"],
      ["Upcoming open houses", "/open-homes"],
    ],
  },
  {
    title: "Locations",
    icon: MapPinned,
    links: [
      ["California neighborhoods", "/neighborhoods"],
      ["San Diego County", "/buy/san-diego"],
      ["Orange County", "/buy/orange"],
      ["Los Angeles County", "/buy/los-angeles"],
      ["San Francisco County", "/buy/san-francisco"],
      ["Property map", "/map"],
    ],
  },
  {
    title: "Buyer & Seller Tools",
    icon: Home,
    links: [
      ["Buy property", "/buy"],
      ["Rent property", "/rent"],
      ["Sell a property", "/sell"],
      ["Home value review", "/home-valuation"],
      ["Recent sales & CMA", "/sold"],
      ["Mortgage calculator", "/mortgage-calculator"],
      ["Affordability calculator", "/affordability-calculator"],
      ["Closing cost estimator", "/closing-cost-estimator"],
    ],
  },
  {
    title: "Services",
    icon: Building2,
    links: [
      ["All services", "/services"],
      ["Concierge home buying", "/services/concierge-home-buying"],
      ["Investment analysis", "/services/investment"],
      ["Relocation support", "/services/relocation"],
      ["Corporate relocation", "/corporate-relocation"],
      ["Service provider directory", "/services/affiliates"],
    ],
  },
  {
    title: "Research",
    icon: FileText,
    links: [
      ["Market reports", "/market-reports"],
      ["Real estate articles", "/blogs"],
      ["Buyer's guide", "/buyers-guide"],
      ["Data methodology", "/about/data-methodology"],
      ["Frequently asked questions", "/faq"],
    ],
  },
  {
    title: "Company",
    icon: Users,
    links: [
      ["About Crown Coastal Homes", "/about"],
      ["Team", "/agents"],
      ["Client testimonials", "/testimonials"],
      ["Contact", "/contact"],
      ["Fair housing", "/fair-housing"],
      ["Accessibility", "/accessibility"],
      ["Privacy policy", "/privacy"],
      ["Terms of use", "/terms"],
    ],
  },
] as const

export default function SiteMapPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-14 text-[var(--coastal-text)] sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-[var(--coastal-primary)]">Navigation</p>
          <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Website Sitemap</h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--coastal-muted-text)] sm:text-lg">
            Browse active property searches, location pages, services, research, and company information.
          </p>
        </header>

        <div className="mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const Icon = group.icon
            return (
              <section key={group.title} aria-labelledby={`sitemap-${group.title.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
                <h2 id={`sitemap-${group.title.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="flex items-center gap-2 border-b border-[var(--coastal-border)] pb-3 text-lg font-semibold">
                  <Icon className="h-5 w-5 text-[var(--coastal-primary)]" aria-hidden />
                  {group.title}
                </h2>
                <ul className="mt-3 space-y-1">
                  {group.links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="inline-flex min-h-11 items-center text-[var(--coastal-muted-text)] hover:text-[var(--coastal-primary)] hover:underline">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      </div>
    </main>
  )
}
