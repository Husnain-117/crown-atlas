"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface NeighborhoodWithCity {
  name: string
  description: string
  href: string
  image?: string
  cityName: string
  cityId: string
  category: string
}

interface NeighborhoodSearchProps {
  neighborhoods: NeighborhoodWithCity[]
  onFilterChange: (filtered: NeighborhoodWithCity[]) => void
}

export default function NeighborhoodSearch({ neighborhoods, onFilterChange }: NeighborhoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState<string>("all")

  const uniqueCities = useMemo(
    () =>
      Array.from(
        new Map(neighborhoods.map((h) => [h.cityId, { id: h.cityId, name: h.cityName }])).values()
      ),
    [neighborhoods]
  )

  // Update parent when filters change
  useEffect(() => {
    const filtered = neighborhoods.filter((hood) => {
      const matchesSearch =
        hood.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hood.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hood.cityName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCity = selectedCity === "all" || hood.cityId === selectedCity
      return matchesSearch && matchesCity
    })
    onFilterChange(filtered)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCity])

  return (
    <div className="mb-12">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search neighborhoods, cities, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 text-base border-2 border-neutral-200 dark:border-slate-700 focus:border-primary-500 dark:focus:border-primary-500"
          />
        </div>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-4 h-12 border-2 border-neutral-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none"
        >
          <option value="all">All Cities</option>
          {uniqueCities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>
      <div className="text-sm text-neutral-600 dark:text-neutral-400">
        {neighborhoods.length} neighborhoods available
      </div>
    </div>
  )
}

