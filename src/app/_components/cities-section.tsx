"use client"

import { useState } from "react"
import Image from "next/image"

interface City {
  name: string
  image: string
  description: string
  link: string
}

interface CitiesSectionProps {
  cities: City[]
}

export default function CitiesSection({ cities }: CitiesSectionProps) {
  const [visibleCities, setVisibleCities] = useState(3)

  const showMoreCities = () => {
    setVisibleCities(prev => Math.min(prev + 3, cities.length))
    setTimeout(() => {
      const citiesGrid = document.querySelector('.cities-grid')
      if (citiesGrid) {
        const lastVisibleCity = citiesGrid.children[Math.min(visibleCities + 2, cities.length - 1)]
        if (lastVisibleCity) {
          lastVisibleCity.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }, 100)
  }

  return (
    <section className="pt-20 md:pt-24 pb-12 md:pb-16 coastal-section-alt relative overflow-hidden theme-transition">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-8 h-[2px] bg-gradient-primary rounded-full"></div>
            <span className="text-[var(--coastal-primary)] font-semibold text-sm uppercase tracking-wider">Discover Cities</span>
            <div className="w-8 h-[2px] bg-gradient-primary rounded-full"></div>
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--coastal-text)] mb-6 text-balance theme-transition">
            Explore Popular
            <span className="block text-gradient-luxury bg-clip-text text-transparent">California Cities</span>
          </h2>
          <p className="text-[var(--coastal-muted-text)] text-lg md:text-xl max-w-3xl mx-auto leading-relaxed text-balance theme-transition">
            Discover homes in California's most sought-after coastal and metropolitan areas, where luxury meets lifestyle.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center cities-grid">
          {cities.slice(0, visibleCities).map((city) => (
            <div
              key={city.name}
              className="group glass-card rounded-3xl shadow-strong overflow-hidden h-96 flex flex-col relative hover-lift"
            >
              {/* City image */}
              <div className="absolute inset-0 z-0">
                {city.image ? (
                  <Image
                    src={city.image}
                    alt={city.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--surface-muted)] to-[var(--coastal-border)] flex items-center justify-center">
                    <Image src="/city-san-diego.jpg" alt="San Diego" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/40 z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--coastal-primary)]/20 via-transparent to-[var(--coastal-secondary)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              </div>

              {/* City info */}
              <div className="relative z-20 mt-auto p-6 md:p-8 pb-6 md:pb-8">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent rounded-b-3xl -mx-6 md:-mx-8 -mb-6 md:-mb-8" />
                <div className="relative z-10">
                  <h3 className="text-2xl lg:text-3xl font-display font-bold text-white mb-2 md:mb-3 group-hover:text-[var(--coastal-accent)] transition-colors duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                    {city.name}
                  </h3>
                  <p className="text-white text-sm md:text-base mb-3 md:mb-4 line-clamp-2 leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] min-h-[2.5rem] font-medium">
                    {city.description}
                  </p>
                  <a
                    href={city.link}
                    className="relative z-10 inline-flex items-center justify-center gap-2 bg-[#6FA8A3] hover:bg-[#5a8d88] backdrop-blur-sm border border-[#6FA8A3]/50 text-white font-semibold text-base px-6 py-3 rounded-[14px] transition-all duration-300 group/link drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] hover:scale-105 mt-2"
                  >
                    <span>View Properties</span>
                    <svg className="w-4 h-4 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {visibleCities < cities.length && (
          <div className="flex justify-center mt-8">
            <button
              onClick={showMoreCities}
              className="group px-8 py-4 bg-[#6FA8A3] hover:bg-[#5a8d88] text-white rounded-[14px] font-semibold transition-all duration-300 shadow-medium hover:shadow-strong hover:scale-105 flex items-center gap-3"
            >
              <span>Show More Cities</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
