"use client"

import { useState, useMemo } from "react"
import { DollarSign, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { formatUSD } from "@/lib/mortgage-calc"

interface CostLine {
  label: string
  low: number
  high: number
  note?: string
}

const COUNTY_DATA: Record<string, { label: string; titleInsuranceRate: number; escrowBase: number; transferTaxRate: number }> = {
  "san-diego":      { label: "San Diego County",      titleInsuranceRate: 0.0020, escrowBase: 1200, transferTaxRate: 0.00055 },
  "los-angeles":    { label: "Los Angeles County",    titleInsuranceRate: 0.0022, escrowBase: 1400, transferTaxRate: 0.00055 },
  "orange-county":  { label: "Orange County",         titleInsuranceRate: 0.0021, escrowBase: 1300, transferTaxRate: 0.00055 },
  "san-francisco":  { label: "San Francisco County",  titleInsuranceRate: 0.0024, escrowBase: 1600, transferTaxRate: 0.00680 },
  "santa-clara":    { label: "Santa Clara County",    titleInsuranceRate: 0.0022, escrowBase: 1400, transferTaxRate: 0.00055 },
  "alameda":        { label: "Alameda County",        titleInsuranceRate: 0.0022, escrowBase: 1400, transferTaxRate: 0.00550 },
  "riverside":      { label: "Riverside County",      titleInsuranceRate: 0.0019, escrowBase: 1000, transferTaxRate: 0.00055 },
  "san-bernardino": { label: "San Bernardino County", titleInsuranceRate: 0.0019, escrowBase: 1000, transferTaxRate: 0.00055 },
  "other":          { label: "Other CA County",       titleInsuranceRate: 0.0020, escrowBase: 1200, transferTaxRate: 0.00055 },
}

export default function ClosingCostForm() {
  const [price, setPrice] = useState(850000)
  const [county, setCounty] = useState("san-diego")

  const costs = useMemo((): CostLine[] => {
    const c = COUNTY_DATA[county] || COUNTY_DATA["other"]
    const loanAmount = price * 0.8 // assume 20% down for cost purposes

    return [
      { label: "Lender origination fee (~1%)", low: loanAmount * 0.008, high: loanAmount * 0.012, note: "0.8–1.2% of loan" },
      { label: "Appraisal", low: 600, high: 900 },
      { label: "Title insurance", low: price * c.titleInsuranceRate * 0.85, high: price * c.titleInsuranceRate * 1.15 },
      { label: "Escrow fee", low: c.escrowBase * 0.8, high: c.escrowBase * 1.2 },
      { label: "Transfer tax", low: price * c.transferTaxRate, high: price * c.transferTaxRate, note: county === "san-francisco" || county === "alameda" ? "Includes city tax" : "CA state $1.10/$1K" },
      { label: "Prepaid property taxes (2 mo)", low: (price * 0.011 / 12) * 2, high: (price * 0.0125 / 12) * 2 },
      { label: "Prepaid homeowner's insurance", low: 1200, high: 2400, note: "1 year upfront" },
      { label: "Recording fees", low: 75, high: 150 },
    ]
  }, [price, county])

  const totalLow = costs.reduce((s, c) => s + c.low, 0)
  const totalHigh = costs.reduce((s, c) => s + c.high, 0)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="text-sm font-medium text-[var(--coastal-text)] flex items-center gap-1.5 mb-2">
            <DollarSign className="h-4 w-4 text-[var(--coastal-primary)]" />
            Purchase Price
          </label>
          <Input
            type="text"
            inputMode="numeric"
            value={price.toLocaleString()}
            onChange={(e) => setPrice(parseInt(e.target.value.replace(/\D/g, "")) || 0)}
            className="h-12 text-lg font-semibold"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[var(--coastal-text)] flex items-center gap-1.5 mb-2">
            <MapPin className="h-4 w-4 text-[var(--coastal-primary)]" />
            County
          </label>
          <Select value={county} onValueChange={setCounty}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(COUNTY_DATA).map(([slug, data]) => (
                <SelectItem key={slug} value={slug}>{data.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--coastal-border)] p-6 shadow-sm">
        <h2 className="font-semibold text-lg text-[var(--coastal-text)] mb-4">Estimated Closing Costs</h2>

        <div className="space-y-3">
          {costs.map((c) => (
            <div key={c.label} className="flex justify-between items-start text-sm">
              <div>
                <span className="text-[var(--coastal-text)]">{c.label}</span>
                {c.note && <span className="text-xs text-[var(--coastal-muted-text)] ml-1">({c.note})</span>}
              </div>
              <span className="font-medium text-[var(--coastal-text)] whitespace-nowrap ml-4">
                {c.low === c.high ? formatUSD(c.low) : `${formatUSD(c.low)} – ${formatUSD(c.high)}`}
              </span>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between items-center">
          <span className="font-semibold text-[var(--coastal-text)]">Total Estimated Closing Costs</span>
          <span className="font-bold text-lg text-[var(--coastal-primary)]">
            {formatUSD(totalLow)} &ndash; {formatUSD(totalHigh)}
          </span>
        </div>

        <div className="mt-4 bg-[var(--surface-muted)] rounded-xl p-4 text-sm text-[var(--coastal-muted-text)]">
          <p>
            Closing costs in California typically range from <strong>2–5%</strong> of the purchase price.
            Your estimate: <strong>{((totalLow / price) * 100).toFixed(1)}–{((totalHigh / price) * 100).toFixed(1)}%</strong> of {formatUSD(price)}.
            Actual costs vary by lender, title company, and specific property. Contact your lender for a detailed Loan Estimate.
          </p>
        </div>
      </div>
    </div>
  )
}
