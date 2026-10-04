import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Home, Building2, Crown, Ship, DollarSign, Building, TreePine, Factory } from "lucide-react"

export const metadata: Metadata = {
  title: "Buy Property in California | Crown Coastal Homes",
  description: "Browse properties for sale in California. Find houses, condos, luxury homes, waterfront properties and more across San Diego, Los Angeles, and San Francisco.",
  openGraph: {
    title: "Buy Property in California",
    description: "Browse all property types for sale in California's coastal cities.",
  },
  alternates: {
    canonical: '/buy',
  },
}

const propertyCategories = [
  {
    name: "Homes",
    href: "/buy/houses",
    icon: Home,
    description: "Single-family homes across California",
    color: "bg-gray-100 dark:bg-gray-800"
  },
  {
    name: "Condos",
    href: "/buy/condos",
    icon: Building2,
    description: "Condominiums and apartment-style living",
    color: "bg-gray-100 dark:bg-gray-800"
  },
  {
    name: "Luxury Homes",
    href: "/buy/luxury",
    icon: Crown,
    description: "High-end luxury properties and estates",
    color: "bg-gray-100 dark:bg-gray-800"
  },
  {
    name: "Waterfront",
    href: "/buy/waterfront",
    icon: Ship,
    description: "Beachfront and waterfront properties",
    color: "bg-gray-100 dark:bg-gray-800"
  },
  {
    name: "Under $1M",
    href: "/buy/under-1m",
    icon: DollarSign,
    description: "Affordable homes under $1 million",
    color: "bg-gray-100 dark:bg-gray-800"
  },
  {
    name: "Townhouses",
    href: "/buy/townhouses",
    icon: Building,
    description: "Multi-level townhomes and row houses",
    color: "bg-gray-100 dark:bg-gray-800"
  },
  {
    name: "Land",
    href: "/buy/land",
    icon: TreePine,
    description: "Vacant land and lots for development",
    color: "bg-gray-100 dark:bg-gray-800"
  },
  {
    name: "Manufactured",
    href: "/buy/manufactured",
    icon: Factory,
    description: "Manufactured and mobile homes",
    color: "bg-gray-100 dark:bg-gray-800"
  },
]

export default function BuyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] theme-transition pb-16">
      {/* Hero Section */}
      <section className="coastal-section-light py-16 md:py-20 relative overflow-hidden theme-transition">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-gradient-primary rounded-full"></div>
              <span className="text-[var(--coastal-primary)] font-semibold text-sm uppercase tracking-wider">
                Property Search
              </span>
              <div className="w-8 h-[2px] bg-gradient-primary rounded-full"></div>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--coastal-text)] mb-6 text-balance theme-transition leading-tight pb-2">
              Search Homes Across
              <span className="block text-gradient-luxury bg-clip-text text-transparent leading-[1.2] pb-1">
                Coastal California
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-[var(--coastal-muted-text)] mb-8 leading-relaxed max-w-3xl mx-auto text-balance theme-transition">
              Browse current for-sale listings by property category, then refine the results by location, price, size, and features.
            </p>
          </div>
        </div>
      </section>

      {/* Property Categories Grid */}
      <section className="py-16 md:py-20 bg-[var(--surface)] theme-transition">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {propertyCategories.map((category, index) => {
                const Icon = category.icon
                return (
                  <Link
                    key={category.href}
                    href={category.href}
                    className="group glass-card rounded-lg p-8 hover-lift transition-all duration-500 border border-[var(--coastal-border)] animate-fade-in-up cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-md ${category.color} mb-6 shadow-medium group-hover:shadow-strong transition-all duration-300 group-hover:scale-110`}>
                      <Icon className="w-8 h-8 text-black dark:text-white" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-[var(--coastal-text)] mb-3 group-hover:text-[var(--coastal-primary)] theme-transition transition-colors">
                      {category.name}
                    </h2>
                    <p className="text-[var(--coastal-muted-text)] leading-relaxed theme-transition">
                      {category.description}
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-[var(--coastal-primary)] font-semibold group-hover:gap-3 transition-all duration-300">
                      <span>Browse {category.name.toLowerCase()}</span>
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-[var(--bg)] theme-transition">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--coastal-text)] mb-6 theme-transition">
              Need Help Finding the Perfect Property?
            </h2>
            <p className="text-xl text-[var(--coastal-muted-text)] mb-8 theme-transition">
              Our expert agents are here to guide you through every step of your home buying journey.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--coastal-primary)] text-white rounded-xl font-semibold hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Contact an Agent
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
