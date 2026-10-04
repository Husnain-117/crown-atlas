"use client"

import { useState, useEffect, useMemo } from "react"
import { ChevronDown, ChevronUp, Percent } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import {
  computeMonthlyBreakdown,
  formatUSD,
  type MonthlyBreakdown,
} from "@/lib/mortgage-calc"
import MortgageCalculatorModal from "./mortage-calculator-modal"
interface Props {
  listingPrice: number
  listingKey: string
  propertyAddress: string
  propertyPageUrl: string
}

export default function ListingPaymentEstimate({ listingPrice, listingKey, propertyAddress, propertyPageUrl }: Props) {
  const [expanded, setExpanded] = useState(true)
  const [downPct, setDownPct] = useState(20)
  const [rate, setRate] = useState(6.5)

  useEffect(() => {
    fetch("/api/mortgage/current-rate")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.rate) setRate(d.rate) })
      .catch(() => {})
  }, [])

  const bd: MonthlyBreakdown = useMemo(
    () => computeMonthlyBreakdown(listingPrice, downPct, rate, 30),
    [listingPrice, downPct, rate]
  )
  return (
    <div className="rounded-[1rem] shadow-md border border-[var(--coastal-border)] bg-[var(--surface)] overflow-hidden">
      {/* Header / toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 sm:p-4 md:p-5 hover:bg-[var(--surface-muted)] transition-colors"
      >
        <div>
          <h3 className="font-semibold text-sm sm:text-base md:text-lg text-[var(--coastal-text)] text-left">Estimate your payment</h3>
          <p className="text-xs sm:text-sm text-[var(--coastal-muted-text)] text-left">{formatUSD(bd.total)}/mo</p>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--coastal-muted-text)]" /> : <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--coastal-muted-text)]" />}
      </button>

      {expanded && (
        <div className="px-3 sm:px-4 md:px-5 pb-4 sm:pb-5 space-y-4 sm:space-y-5">
          <Separator />

          {/* Down Payment slider */}
          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-2">
              <span className="text-[var(--coastal-muted-text)] flex items-center gap-1"><Percent className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Down Payment</span>
              <span className="font-semibold text-[var(--coastal-text)]">{downPct}% ({formatUSD(listingPrice * downPct / 100)})</span>
            </div>
            <Slider aria-label="Down payment percentage" value={[downPct]} min={3} max={50} step={1} onValueChange={(v) => setDownPct(v[0])} />
          </div>

          {/* Interest rate slider */}
          <div>
            <div className="flex justify-between text-xs sm:text-sm mb-2">
              <span className="text-[var(--coastal-muted-text)] flex items-center gap-1"><Percent className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Interest Rate</span>
              <span className="font-semibold text-[var(--coastal-text)]">{rate.toFixed(2)}%</span>
            </div>
            <Slider aria-label="Interest rate" value={[rate]} min={2} max={10} step={0.125} onValueChange={(v) => setRate(v[0])} />
          </div>

          {/* Breakdown */}
          <div className="space-y-2 text-xs sm:text-sm">
            <LineItem label="Principal & Interest" value={bd.principalAndInterest} />
            <LineItem label="Property Tax" value={bd.propertyTax} />
            <LineItem label="Insurance" value={bd.insurance} />
            {bd.pmi > 0 && <LineItem label="PMI" value={bd.pmi} />}
            <Separator />
            <div className="flex justify-between font-semibold text-[var(--coastal-text)]">
              <span>Total Monthly</span>
              <span>{formatUSD(bd.total)}/mo</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-2 pt-1">
            <MortgageCalculatorModal
              propertyPrice={listingPrice}
              listingKey={listingKey}
              propertyAddress={propertyAddress}
              propertyTaxRate={0.011}
              insuranceRate={0.0035}
              hoaFees={0}
              buttonText="Full Calculator"
              buttonClassName="w-full border border-[var(--coastal-border)] bg-[var(--surface)] text-[var(--coastal-text)] hover:bg-[var(--surface-muted)] cursor-pointer"
              buttonVariant="outline"
            />
            <Link
              href={{
                pathname: "/contact",
                query: {
                  inquiry: "financing",
                  listingKey,
                  propertyAddress,
                  propertyPageUrl,
                },
              }}
              className="block w-full text-center py-2.5 rounded-lg bg-[var(--coastal-primary)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Get pre-approved
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function LineItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-[var(--coastal-muted-text)] text-xs sm:text-sm">
      <span>{label}</span>
      <span className="text-[var(--coastal-text)]">{formatUSD(value)}/mo</span>
    </div>
  )
}
