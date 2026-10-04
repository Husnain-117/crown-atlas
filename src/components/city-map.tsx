"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

const CityMapInner = dynamic(() => import("./city-map-inner"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100">Loading map...</div>
})

interface CityMapWrapperProps {
  bounds: [number, number, number, number]
  properties: any[]
}

export default function CityMapWrapper({ bounds, properties }: CityMapWrapperProps) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
    }
  }, [])

  // Don't render map until mounted on client
  if (!mounted) {
    return (
      <div className="aspect-video bg-gray-200 dark:bg-slate-800 rounded-xl shadow-medium overflow-hidden flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
      </div>
    )
  }

  // Key by pathname forces React to unmount/remount on route change
  // The pure Leaflet approach in CityMapInner handles cleanup properly
  const mapKey = `city-map-${pathname}`

  try {
    return (
      <div key={mapKey} className="aspect-video bg-gray-200 dark:bg-slate-800 rounded-xl shadow-medium overflow-hidden relative" style={{ isolation: 'isolate', zIndex: 0 }}>
        <CityMapInner key={mapKey} bounds={bounds} properties={properties} />
      </div>
    )
  } catch (error) {
    console.error('CityMapWrapper: Error rendering map:', error)
    return (
      <div className="aspect-video bg-gray-200 dark:bg-slate-800 rounded-xl shadow-medium overflow-hidden flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Map temporarily unavailable</div>
      </div>
    )
  }
}
