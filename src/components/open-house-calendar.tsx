"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CalendarDays, Loader2 } from "lucide-react"

import { PropertyCard } from "@/components/property-card"
import { OpenHouseSchedule } from "@/components/open-house-schedule"
import { openHouseGroupDate, openHouseSchedule } from "@/lib/open-house-time"
import type { Property } from "@/interfaces"

export default function OpenHouseCalendar() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const response = await fetch("/api/properties?openHousesOnly=true&limit=100", {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Open-house request failed with ${response.status}`)
        const json = await response.json()
        if (json.dataAvailable === false) {
          setError(true)
          return
        }
        setProperties(json.properties || json.data || [])
      } catch (loadError) {
        if (controller.signal.aborted) return
        console.error("Failed to load open house properties:", loadError)
        setError(true)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [])

  const grouped = useMemo(() => {
    const groups = new Map<string, { property: Property; schedule: NonNullable<ReturnType<typeof openHouseSchedule>> }[]>()

    for (const property of properties) {
      const schedule = openHouseSchedule(property.open_house_start_timestamp, property.open_house_end_timestamp)
      if (!schedule) continue
      const group = groups.get(schedule.day) || []
      group.push({ property, schedule })
      groups.set(schedule.day, group)
    }

    for (const group of groups.values()) group.sort((a, b) => a.schedule.startIso.localeCompare(b.schedule.startIso))
    return [...groups.entries()].sort(([first], [second]) => first.localeCompare(second))
  }, [properties])

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--coastal-muted-text)]" aria-hidden />
        <span className="sr-only">Loading upcoming open houses</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-14 text-center" role="alert">
        <CalendarDays className="mb-4 h-12 w-12 text-[var(--coastal-muted-text)]" aria-hidden />
        <h3 className="text-xl font-semibold text-[var(--coastal-text)]">Open-house times are unavailable</h3>
        <p className="mt-2 max-w-md text-[var(--coastal-muted-text)]">
          We could not load the current schedule. You can still browse active listings and request a property-specific tour.
        </p>
        <Link href="/properties" className="mt-5 inline-flex min-h-11 items-center font-semibold text-[var(--coastal-primary)] hover:underline">
          Browse active listings
        </Link>
      </div>
    )
  }

  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
        <CalendarDays className="mb-4 h-12 w-12 text-[var(--coastal-muted-text)]" aria-hidden />
        <h3 className="text-xl font-semibold text-[var(--coastal-text)]">No upcoming open houses found</h3>
        <p className="mt-2 max-w-md text-[var(--coastal-muted-text)]">
          No future open-house times are present in the current listing data. Schedule details can change, so verify them before traveling.
        </p>
        <Link href="/properties" className="mt-5 inline-flex min-h-11 items-center font-semibold text-[var(--coastal-primary)] hover:underline">
          Browse active listings
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {grouped.map(([key, group]) => (
        <section key={key} aria-labelledby={`open-house-${key}`}>
          <h3 id={`open-house-${key}`} className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-[var(--coastal-border)] pb-4 text-base font-semibold text-[var(--coastal-text)] sm:text-lg">
            <CalendarDays className="h-5 w-5 shrink-0 text-[var(--coastal-primary)]" aria-hidden />
            <span className="min-w-0">{openHouseGroupDate(key)}</span>
            <span className="text-sm font-normal text-[var(--coastal-muted-text)]">
              ({group.length} {group.length === 1 ? "home" : "homes"})
            </span>
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {group.map(({ property, schedule }) => (
              <PropertyCard
                key={property.listing_key || property.id}
                property={property}
                showCompareButton={false}
                schedule={<OpenHouseSchedule schedule={schedule} />}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
