"use client"

import { useRef } from "react"
import Link from "next/link"
import { ArrowRight, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { FeaturedPropertyCard } from "@/components/featured-property-card"
import { Property } from "@/interfaces"

interface FeaturedPropertiesSectionProps {
  initialProperties: Property[]
}

export default function FeaturedPropertiesSection({ initialProperties }: FeaturedPropertiesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const displayProperties = initialProperties.slice(0, 6)

  // ── Carousel scroll ───────────────────────────────────────────────────────
  const scrollByOne = (dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth
    el.scrollBy({ left: dir === "right" ? step : -step, behavior: "smooth" })
  }

  return (
    <section
      id="featured-properties"
      className="py-12 md:py-24 bg-[var(--bg)] relative overflow-hidden z-10 theme-transition"
    >
      <div className="container mx-auto relative z-10">

        {/* ── Section heading ─────────────────────────────────────────────── */}
        <div className="text-left lg:text-center mb-8 px-4 max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="hidden lg:block h-px bg-[var(--coastal-primary)]/30 flex-1 max-w-[120px]" />
            <span className="block text-[var(--coastal-text)] text-sm font-bold tracking-[0.2em] uppercase">
              Featured Properties
            </span>
            <div className="hidden lg:block h-px bg-[var(--coastal-primary)]/30 flex-1 max-w-[120px]" />
          </div>

          <h2 className="mb-4 font-display text-3xl font-bold leading-tight lg:mb-6 lg:text-5xl">
            <span className="block text-[var(--coastal-text)]">Current California</span>
            <span className="block text-[var(--coastal-link)]">Property Listings</span>
          </h2>
          <p className="mx-auto hidden max-w-3xl text-lg leading-relaxed text-[var(--coastal-muted-text)] lg:block">
            Review current property details, photos, prices, and locations from CRMLS-backed listing data.
          </p>
        </div>

        {/* ── Property cards ───────────────────────────────────────────────── */}
        {displayProperties.length === 0 ? (
          <div className="text-center py-20 px-4">
            <p className="text-[var(--coastal-muted-text)] text-lg mb-3">
              Featured listings are refreshing right now.
            </p>
            <Link
              href="/properties"
              className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--coastal-primary)] hover:underline"
            >
              Browse all available homes
            </Link>
          </div>
        ) : (
          <div className="relative">
            <div
              ref={scrollRef}
              className="flex overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory scroll-smooth px-4 gap-0 lg:gap-4"
            >
              {displayProperties.map((property, index) => (
                <div
                  key={property.listing_key || property.id || `featured-${index}`}
                  data-featured-slide
                  className="min-w-full lg:min-w-[320px] lg:max-w-[340px] w-full lg:w-auto flex-shrink-0 snap-center"
                >
                  <FeaturedPropertyCard property={property} />
                </div>
              ))}
            </div>

            <button
              type="button"
              aria-label="Previous property"
              className="flex absolute left-2 lg:left-0 top-1/2 -translate-y-1/2 bg-[#0F2A44] hover:bg-[#1a3b5c] rounded-full shadow-xl p-3 z-30 transition-all duration-300 hover:scale-110 text-white items-center justify-center"
              onClick={() => scrollByOne("left")}
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label="Next property"
              className="flex absolute right-2 lg:right-0 top-1/2 -translate-y-1/2 bg-[#0F2A44] hover:bg-[#1a3b5c] rounded-full shadow-xl p-3 z-30 transition-all duration-300 hover:scale-110 text-white items-center justify-center"
              onClick={() => scrollByOne("right")}
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* ── Explore All button ───────────────────────────────────────────── */}
        <div className="flex justify-center mt-8">
          <Link
            href="/properties"
            className="flex items-center gap-2 rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] px-8 py-3 font-bold text-[var(--coastal-text)] transition-colors hover:bg-[var(--coastal-primary)] hover:text-white"
          >
            <span>Explore All Properties</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

      </div>
    </section>
  )
}
