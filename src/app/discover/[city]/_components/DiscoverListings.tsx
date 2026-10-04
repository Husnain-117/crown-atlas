"use client"

import { useEffect, useState } from "react"
import { PropertyCard } from "@/components/property-card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DiscoverListings({ cityName, citySlug: _citySlug }: { cityName: string, citySlug: string }) {
    const [properties, setProperties] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchListings() {
            try {
                const res = await fetch(`/api/properties?city=${encodeURIComponent(cityName)}&limit=12`)
                if (res.ok) {
                    const data = await res.json()
                    setProperties(data.data || [])
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchListings()
    }, [cityName])

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 auto-rows-fr">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-3">
                        <Skeleton className="h-[250px] md:h-[300px] w-full rounded-xl" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
            </div>
        )
    }

    if (properties.length === 0) {
        return (
            <div className="p-8 text-center text-[var(--coastal-muted-text)] bg-[var(--surface-muted)] rounded-2xl border border-[var(--coastal-border)]">
                No featured properties available in {cityName} right now. Check back soon or adjust your search.
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 auto-rows-fr">
            {properties.map((property) => (
                <PropertyCard key={property.id || property.listing_key} property={property} />
            ))}
        </div>
    )
}
