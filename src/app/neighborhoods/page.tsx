import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MapPin, Home } from "lucide-react"
import { citiesData } from "@/lib/city-data"
import { getAllNeighborhoodsManifest } from "@/lib/neighborhood-utils"
import NeighborhoodsClient from "./NeighborhoodsClient"

// Neighborhood list changes infrequently — revalidate every 6 hours.
export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Explore California Neighborhoods | Crown Coastal Homes",
  description:
    "Compare California neighborhood pages with current listing links, area descriptions, and location-specific research guidance.",
  openGraph: {
    title: "Explore 105 California Neighborhoods | Crown Coastal Homes",
    description:
      "Explore neighborhood pages across California coastal cities with current listings and area-specific research links.",
    type: "website",
  },
  alternates: {
    canonical: "https://crowncoastalhomes.com/neighborhoods",
  },
}

export default function NeighborhoodsPage() {
  const manifest = getAllNeighborhoodsManifest()
  const cityCount = Object.keys(citiesData).length

  // Map manifest to the shape NeighborhoodsClient expects
  const neighborhoods = manifest.map((item) => ({
    name: item.neighborhood.name,
    description: item.neighborhood.description,
    href: item.neighborhood.href,
    image: item.neighborhood.image,
    cityName: item.cityName,
    cityId: item.cityId,
    category: item.category,
  }))

  return (
    <div className="bg-[var(--bg)] theme-transition min-h-screen">

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative overflow-hidden bg-[var(--coastal-primary)] py-16 sm:py-20 md:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-3 mb-5">
              <div className="w-8 h-px bg-[var(--coastal-secondary)]" />
              <span className="text-[var(--coastal-secondary)] font-semibold text-xs uppercase tracking-widest">
                California Real Estate
              </span>
              <div className="w-8 h-px bg-[var(--coastal-secondary)]" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-5">
              Discover California's
              <span className="block text-[var(--coastal-secondary)] mt-1">
                Neighborhoods
              </span>
            </h1>

            <p className="text-white/75 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              From vibrant coastal communities to serene suburban enclaves — explore
              {" "}{manifest.length} curated neighborhoods across {cityCount} California cities.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════ STATS BAR ════════════════ */}
      <section className="bg-[var(--surface)] border-b border-[var(--coastal-border)] shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-[var(--coastal-border)]">
            <div className="py-5 px-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[var(--coastal-primary)]">
                {manifest.length}
              </div>
              <div className="text-xs sm:text-sm text-[var(--coastal-muted-text)] font-medium mt-0.5">
                Neighborhoods
              </div>
            </div>
            <div className="py-5 px-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[var(--coastal-secondary)]">
                {cityCount}
              </div>
              <div className="text-xs sm:text-sm text-[var(--coastal-muted-text)] font-medium mt-0.5">
                Cities
              </div>
            </div>
            <div className="py-5 px-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[var(--success)]">
                Current
              </div>
              <div className="text-xs sm:text-sm text-[var(--coastal-muted-text)] font-medium mt-0.5">
                Listing Links
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ GRID + SEARCH ════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16 pb-0 sm:pb-0 md:pb-0">
        <NeighborhoodsClient neighborhoods={neighborhoods} />
      </div>

      {/* ════════════════ CTA ════════════════ */}
      <section className="bg-[var(--coastal-primary)] py-14 md:py-20 mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Compare Areas With Current Information
          </h2>
          <p className="text-white/75 text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Review listings, housing types, transportation, amenities, and other factors that matter to your own search.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-[var(--coastal-primary)] hover:bg-white/90 px-8 py-6 text-base font-bold shadow-xl hover:-translate-y-0.5 transition-all border-0"
              >
                <MapPin className="h-5 w-5 mr-2" aria-hidden />
                Request Area Information
              </Button>
            </Link>
            <Link href="/buy">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-[var(--coastal-primary)] px-8 py-6 text-base font-bold transition-all"
              >
                <Home className="h-5 w-5 mr-2" aria-hidden />
                Browse All Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
