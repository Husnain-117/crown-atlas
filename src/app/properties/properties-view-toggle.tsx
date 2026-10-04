"use client"

import { useState } from "react"
import { List, Map } from "lucide-react"
import dynamic from "next/dynamic"

const PropertiesSplitView = dynamic(() => import("./properties-split-view"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-[var(--surface-muted)] rounded-[1rem] animate-pulse flex items-center justify-center">
      <span className="text-[var(--coastal-muted-text)]">Loading map view...</span>
    </div>
  ),
})

interface PropertiesViewToggleProps {
  listContent: React.ReactNode
}

export default function PropertiesViewToggle({ listContent }: PropertiesViewToggleProps) {
  const [view, setView] = useState<"list" | "map">("list")

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setView("list")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius)] text-sm font-medium transition-all duration-200 ${
            view === "list"
              ? "bg-[var(--coastal-primary)] text-white shadow-md"
              : "bg-[var(--surface)] text-[var(--coastal-text)] border border-[var(--coastal-border)] hover:bg-[var(--surface-muted)]"
          }`}
        >
          <List className="h-4 w-4" />
          List View
        </button>
        <button
          onClick={() => setView("map")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius)] text-sm font-medium transition-all duration-200 ${
            view === "map"
              ? "bg-[var(--coastal-primary)] text-white shadow-md"
              : "bg-[var(--surface)] text-[var(--coastal-text)] border border-[var(--coastal-border)] hover:bg-[var(--surface-muted)]"
          }`}
        >
          <Map className="h-4 w-4" />
          Map View
        </button>
      </div>

      {view === "list" ? listContent : <PropertiesSplitView />}
    </>
  )
}
