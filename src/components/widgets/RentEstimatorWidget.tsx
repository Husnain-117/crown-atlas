"use client"

import { useState } from "react"
import { Building2, Home, Calculator } from "lucide-react"

export default function RentEstimatorWidget({ cityName }: { cityName: string }) {
    const [beds, setBeds] = useState(2)
    const [baths, setBaths] = useState(2)
    const [propertyType, setPropertyType] = useState<"house" | "apartment" | "condo">("apartment")

    // Simple hardcoded model based on inputs
    const baseRates = {
        apartment: 2200,
        condo: 2500,
        house: 3500
    }

    const bedValue = 500
    const bathValue = 300

    // The base formula
    let estimate = baseRates[propertyType] + ((beds - 1) * bedValue) + ((baths - 1) * bathValue)

    // High-value city adjustments 
    if (['La Jolla', 'Del Mar', 'Coronado'].some(c => cityName.includes(c))) {
        estimate *= 1.4
    } else if (['Carlsbad', 'Encinitas', 'Solana Beach'].some(c => cityName.includes(c))) {
        estimate *= 1.2
    } else if (cityName.includes('Chula Vista') || cityName.includes('El Cajon')) {
        estimate *= 0.85
    }

    const formatCurrency = (val: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val)

    return (
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--coastal-border)] shadow-sm overflow-hidden mt-10 mb-10">
            <div className="bg-[var(--coastal-primary)] text-white p-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Calculator className="h-6 w-6" />
                    {cityName} Rent Estimator
                </h2>
                <p className="text-white/80 mt-1">Select your ideal property details to see estimated monthly rent.</p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-medium mb-3 block text-[var(--coastal-text)]">Property Type</label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['apartment', 'condo', 'house'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setPropertyType(type)}
                                    className={`py-3 px-2 rounded-lg border text-sm font-medium capitalize flex flex-col items-center gap-2 transition-all ${propertyType === type
                                            ? "border-[var(--coastal-primary)] bg-[var(--coastal-primary)]/5 text-[var(--coastal-primary)]"
                                            : "border-[var(--coastal-border)] hover:border-[var(--coastal-primary)]/50 text-[var(--coastal-text)]"
                                        }`}
                                >
                                    {type === 'house' ? <Home className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-3 block text-[var(--coastal-text)]">Bedrooms</label>
                            <div className="flex items-center rounded-lg border border-[var(--coastal-border)] overflow-hidden">
                                {[1, 2, 3, 4, 5].map(num => (
                                    <button
                                        key={`bed-${num}`}
                                        onClick={() => setBeds(num)}
                                        className={`flex-1 py-2 text-sm font-medium border-r last:border-r-0 border-[var(--coastal-border)] transition-colors ${beds === num ? "bg-[var(--coastal-primary)] text-white" : "hover:bg-[var(--surface-muted)]"
                                            }`}
                                    >
                                        {num}{num === 5 ? "+" : ""}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-3 block text-[var(--coastal-text)]">Bathrooms</label>
                            <div className="flex items-center rounded-lg border border-[var(--coastal-border)] overflow-hidden">
                                {[1, 2, 3, 4].map(num => (
                                    <button
                                        key={`bath-${num}`}
                                        onClick={() => setBaths(num)}
                                        className={`flex-1 py-2 text-sm font-medium border-r last:border-r-0 border-[var(--coastal-border)] transition-colors ${baths === num ? "bg-[var(--coastal-primary)] text-white" : "hover:bg-[var(--surface-muted)]"
                                            }`}
                                    >
                                        {num}{num === 4 ? "+" : ""}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center p-8 bg-[var(--surface-muted)] rounded-xl border border-[var(--coastal-border)] text-center">
                    <p className="text-[var(--coastal-muted-text)] font-medium mb-2 uppercase tracking-wide text-xs">Estimated Monthly Rent</p>
                    <div className="text-5xl font-bold text-[var(--coastal-text)] tabular-nums tracking-tight">
                        {formatCurrency(estimate)}
                    </div>
                    <p className="text-sm text-[var(--coastal-muted-text)] mt-4 max-w-[250px]">
                        Based on current {cityName} market averages for {beds}-bed, {baths}-bath {propertyType}s.
                    </p>
                </div>
            </div>
        </div>
    )
}
