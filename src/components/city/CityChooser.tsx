"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface CityChooserItem {
  city: string
  slug: string
  count: number
  medianPrice?: number
  imageUrl?: string
}

interface Props {
  title: string
  subtitle: string
  countyName: string
  countySlug: string
  action: "buy" | "rent"
  cities: CityChooserItem[]
  primaryCta: string
}

export default function CityChooser({
  title,
  subtitle,
  countyName,
  countySlug,
  action,
  cities,
  primaryCta
}: Props) {
  const [query, setQuery] = useState("")
  const [debounced, setDebounced] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim().toLowerCase()), 300)
    return () => clearTimeout(timer)
  }, [query])

  const sortedCities = useMemo(() => {
    return [...cities].sort((a, b) => b.count - a.count)
  }, [cities])

  const popular = sortedCities.slice(0, 5)

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[var(--coastal-muted-text)]">
            Home / {countyName} / {action === "buy" ? "Buy" : "Rent"}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--coastal-text)]">{title}</h1>
          <p className="text-base md:text-lg text-[var(--coastal-muted-text)]">{subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${action}/${countySlug}`}
              className="inline-flex items-center px-4 py-2 rounded-md bg-[var(--coastal-primary)] text-white font-semibold"
            >
              {primaryCta}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-4 py-2 rounded-md border border-[var(--coastal-border)] text-[var(--coastal-text)] font-semibold"
            >
              Talk to an Agent
            </Link>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--coastal-border)] rounded-xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--coastal-text)] mb-2">
                Search cities in {countyName}
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by city name..."
                className="w-full border border-[var(--coastal-border)] rounded-md px-3 py-2 bg-[var(--surface)] text-[var(--coastal-text)]"
              />
            </div>
            <div className="text-sm text-[var(--coastal-muted-text)]">
              {cities.length} cities · Updated hourly
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-[var(--coastal-text)]">Most Popular</h2>
          <div className="flex flex-wrap gap-3">
            {popular.map((city) => (
              <Link
                key={`popular-${city.slug}`}
                href={`/${action}/${countySlug}/${city.slug}`}
                className="px-3 py-2 rounded-md bg-[var(--surface-muted)] border border-[var(--coastal-border)] text-sm"
              >
                {city.city} · {city.count.toLocaleString()}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[var(--coastal-text)] mb-4">
            All Cities — {countyName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedCities.map((city) => {
              const match = !debounced || city.city.toLowerCase().includes(debounced)
              return (
                <Link
                  key={city.slug}
                  href={`/${action}/${countySlug}/${city.slug}`}
                  aria-hidden={!match}
                  className={cn(
                    "border border-[var(--coastal-border)] rounded-xl overflow-hidden bg-[var(--surface)] shadow-sm hover:shadow-md transition-shadow",
                    match ? "block" : "hidden"
                  )}
                >
                  <div className="relative h-36 w-full bg-[var(--surface-muted)]">
                    {city.imageUrl ? (
                      <Image
                        src={city.imageUrl}
                        alt={`${city.city} skyline`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-[var(--coastal-muted-text)]">
                        {city.city}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[var(--coastal-text)]">{city.city}, CA</h3>
                    <p className="text-sm text-[var(--coastal-muted-text)]">
                      {city.count.toLocaleString()} {action === "buy" ? "homes" : "rentals"}
                    </p>
                    {city.medianPrice && (
                      <p className="text-sm text-[var(--coastal-muted-text)]">
                        Median ${Math.round(city.medianPrice).toLocaleString()}
                      </p>
                    )}
                    <div className="mt-3 text-sm font-semibold text-[var(--coastal-primary)]">
                      View {action === "buy" ? "Homes" : "Rentals"} →
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
