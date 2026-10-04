"use client"

import { useState } from "react"
import { MapPin, Search, Coffee, School, DollarSign, Building, Waves } from "lucide-react"

interface Neighborhood {
    name?: string
    neighborhood?: string
    median_price?: number
    avg_dom?: number
    walk_score?: number
    best_for?: string
}

interface Props {
    neighborhoods: Neighborhood[]
    cityName: string
}

type Vibe = "Schools" | "Walkability" | "Luxury" | "Affordable" | "Views/Nature"

export default function NeighborhoodSelectorWidget({ neighborhoods = [], cityName }: Props) {
    const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null)

    // If no neighborhood data, don't render or render a fallback
    if (!neighborhoods || neighborhoods.length === 0) {
        return null
    }

    const normalizedNavs = neighborhoods.map(n => ({
        name: n.name || n.neighborhood || "Neighborhood",
        price: n.median_price || 0,
        walkScore: n.walk_score || 50,
        bestFor: (n.best_for || "").toLowerCase()
    }))

    const getFilteredNeighborhoods = () => {
        if (!selectedVibe) return []

        switch (selectedVibe) {
            case "Schools":
                return normalizedNavs.filter(n => n.bestFor.includes("school") || n.bestFor.includes("family")).slice(0, 2)
            case "Walkability":
                return [...normalizedNavs].sort((a, b) => b.walkScore - a.walkScore).slice(0, 2)
            case "Luxury":
                return [...normalizedNavs].sort((a, b) => b.price - a.price).slice(0, 2)
            case "Affordable":
                return [...normalizedNavs].filter(n => n.price > 0).sort((a, b) => a.price - b.price).slice(0, 2)
            case "Views/Nature":
                return normalizedNavs.filter(n => n.bestFor.includes("view") || n.bestFor.includes("beach") || n.bestFor.includes("park") || n.bestFor.includes("nature")).slice(0, 2)
            default:
                return []
        }
    }

    const results = getFilteredNeighborhoods()
    // Fallback if the vibe filter returns empty (due to lack of matched tags)
    const finalResults = results.length > 0 ? results : normalizedNavs.slice(0, 2)

    const formatCurrency = (val: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val)

    return (
        <div className="bg-background rounded-xl border border-[var(--coastal-border)] shadow-sm overflow-hidden mt-6 mb-10">
            <div className="p-6 border-b border-[var(--coastal-border)] bg-[var(--surface-muted)]">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-[var(--coastal-text)]">
                    <MapPin className="h-5 w-5 text-[var(--coastal-primary)]" />
                    Find Your Perfect {cityName} Neighborhood
                </h2>
                <p className="text-[var(--coastal-muted-text)] mt-1 text-sm">Select what matters most to you to get personalized recommendations.</p>
            </div>

            <div className="p-6">
                <div className="flex flex-wrap gap-3 mb-8 justify-center">
                    <button
                        onClick={() => setSelectedVibe("Schools")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors border ${selectedVibe === "Schools" ? "bg-[var(--coastal-primary)] border-[var(--coastal-primary)] text-white" : "border-[var(--coastal-border)] text-[var(--coastal-text)] hover:bg-[var(--surface-muted)]"}`}
                    >
                        <School className="w-4 h-4" /> Families & Schools
                    </button>
                    <button
                        onClick={() => setSelectedVibe("Walkability")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors border ${selectedVibe === "Walkability" ? "bg-[var(--coastal-primary)] border-[var(--coastal-primary)] text-white" : "border-[var(--coastal-border)] text-[var(--coastal-text)] hover:bg-[var(--surface-muted)]"}`}
                    >
                        <Coffee className="w-4 h-4" /> Walkable & Dining
                    </button>
                    <button
                        onClick={() => setSelectedVibe("Luxury")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors border ${selectedVibe === "Luxury" ? "bg-[var(--coastal-primary)] border-[var(--coastal-primary)] text-white" : "border-[var(--coastal-border)] text-[var(--coastal-text)] hover:bg-[var(--surface-muted)]"}`}
                    >
                        <Building className="w-4 h-4" /> Luxury & Estates
                    </button>
                    <button
                        onClick={() => setSelectedVibe("Affordable")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors border ${selectedVibe === "Affordable" ? "bg-[var(--coastal-primary)] border-[var(--coastal-primary)] text-white" : "border-[var(--coastal-border)] text-[var(--coastal-text)] hover:bg-[var(--surface-muted)]"}`}
                    >
                        <DollarSign className="w-4 h-4" /> Best Value
                    </button>
                    <button
                        onClick={() => setSelectedVibe("Views/Nature")}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors border ${selectedVibe === "Views/Nature" ? "bg-[var(--coastal-primary)] border-[var(--coastal-primary)] text-white" : "border-[var(--coastal-border)] text-[var(--coastal-text)] hover:bg-[var(--surface-muted)]"}`}
                    >
                        <Waves className="w-4 h-4" /> Views & Nature
                    </button>
                </div>

                {selectedVibe ? (
                    <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--coastal-border)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h3 className="text-sm font-semibold text-[var(--coastal-muted-text)] tracking-wider uppercase mb-4 flex items-center gap-2">
                            <Search className="w-4 h-4" /> Top Matches
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {finalResults.map((n, i) => (
                                <div key={i} className="bg-white p-5 rounded-lg border border-[var(--coastal-border)] shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-lg text-[var(--coastal-text)]">{n.name}</h4>
                                        {n.walkScore > 0 && (
                                            <span className="bg-[var(--chip-active)] text-[var(--coastal-primary)] text-xs font-bold px-2 py-1 rounded-full">
                                                Walk Score: {n.walkScore}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-1 text-sm text-[var(--coastal-muted-text)]">
                                        <p>Median Price: <strong className="text-[var(--coastal-text)]">{n.price ? formatCurrency(n.price) : "Contact Us"}</strong></p>
                                        <p className="capitalize">Best for: {n.bestFor || selectedVibe}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-[var(--coastal-muted-text)]">
                        <MapPin className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Select a vibe above to see our top neighborhood recommendations.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
