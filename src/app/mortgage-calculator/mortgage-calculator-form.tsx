"use client"

import { useState, useEffect, useMemo } from "react"
import { DollarSign, Percent } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  computeMonthlyBreakdown,
  computeMonthlyPI,
  buildAmortizationByYear,
  formatUSD,
  type MonthlyBreakdown,
} from "@/lib/mortgage-calc"

export default function MortgageCalculatorForm() {
  const [homePrice, setHomePrice] = useState(850000)
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)
  const [interestRate, setInterestRate] = useState(6.5)
  const [loanTerm, setLoanTerm] = useState<15 | 20 | 30>(30)

  useEffect(() => {
    fetch("/api/mortgage/current-rate")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.rate) setInterestRate(d.rate) })
      .catch(() => {})
  }, [])

  const breakdown: MonthlyBreakdown = useMemo(
    () => computeMonthlyBreakdown(homePrice, downPaymentPercent, interestRate, loanTerm),
    [homePrice, downPaymentPercent, interestRate, loanTerm]
  )

  const loanAmount = homePrice - homePrice * (downPaymentPercent / 100)

  // Monthly Principal & Interest only (tax/insurance/PMI are part of breakdown.total).
  const monthlyPI = useMemo(() => computeMonthlyPI(loanAmount, interestRate, loanTerm), [loanAmount, interestRate, loanTerm])

  const amortization = useMemo(
    () => buildAmortizationByYear(loanAmount, interestRate, loanTerm),
    [loanAmount, interestRate, loanTerm]
  )

  const totalInterestOverLife = useMemo(
    () => amortization.reduce((sum, row) => sum + (row.interestPaid ?? 0), 0),
    [amortization]
  )

  const firstMonthInterest = useMemo(() => {
    const r = interestRate / 100 / 12
    return loanAmount > 0 && r > 0 ? loanAmount * r : 0
  }, [loanAmount, interestRate])

  const firstMonthPrincipal = useMemo(() => {
    return Math.max(0, monthlyPI - firstMonthInterest)
  }, [monthlyPI, firstMonthInterest])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Home Price */}
          <div>
            <label className="text-sm font-medium text-[var(--coastal-text)] flex items-center gap-1.5 mb-2">
              <DollarSign className="h-4 w-4 text-[var(--coastal-primary)]" />
              Home Price &mdash; {formatUSD(homePrice)}
            </label>
            <Slider
              aria-label="Home price"
              value={[homePrice]}
              min={100000}
              max={10000000}
              step={10000}
              onValueChange={(v) => setHomePrice(v[0])}
            />
            <Input
              type="text"
              inputMode="numeric"
              value={homePrice.toLocaleString()}
              onChange={(e) => {
                const v = parseInt(e.target.value.replace(/\D/g, "")) || 0
                setHomePrice(v)
              }}
              className="h-12 text-lg font-semibold"
            />
          </div>

          {/* Down Payment */}
          <div>
            <label className="text-sm font-medium text-[var(--coastal-text)] flex items-center gap-1.5 mb-2">
              <Percent className="h-4 w-4 text-[var(--coastal-primary)]" />
              Down Payment &mdash; {downPaymentPercent}% ({formatUSD(homePrice * downPaymentPercent / 100)})
            </label>
            <Slider
              aria-label="Down payment percentage"
              value={[downPaymentPercent]}
              min={3}
              max={50}
              step={1}
              onValueChange={(v) => setDownPaymentPercent(v[0])}
            />
            <div className="flex justify-between text-xs text-[var(--coastal-muted-text)] mt-1">
              <span>3%</span><span>20%</span><span>50%</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <label className="text-sm font-medium text-[var(--coastal-text)] flex items-center gap-1.5 mb-2">
              <Percent className="h-4 w-4 text-[var(--coastal-primary)]" />
              Interest Rate &mdash; {interestRate.toFixed(2)}%
            </label>
            <Slider
              aria-label="Interest rate"
              value={[interestRate]}
              min={2}
              max={10}
              step={0.125}
              onValueChange={(v) => setInterestRate(v[0])}
            />
            <div className="flex justify-between text-xs text-[var(--coastal-muted-text)] mt-1">
              <span>2%</span><span>6%</span><span>10%</span>
            </div>
          </div>

          {/* Loan Term */}
          <div>
            <label className="text-sm font-medium text-[var(--coastal-text)] mb-2 block">Loan Term</label>
            <div className="flex gap-2">
              {([15, 20, 30] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setLoanTerm(t)}
                  className={`min-h-11 flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                    loanTerm === t
                      ? "bg-[var(--coastal-primary)] text-white border-[var(--coastal-primary)]"
                      : "bg-[var(--surface)] text-[var(--coastal-text)] border-[var(--coastal-border)] hover:border-[var(--coastal-primary)]"
                  }`}
                >
                  {t} years
                </button>
              ))}
            </div>
          </div>

          <div className="text-sm text-[var(--coastal-muted-text)] pt-2">
            Loan Amount: <span className="font-semibold text-[var(--coastal-text)]">{formatUSD(loanAmount)}</span>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid min-h-11 w-full grid-cols-2 mb-4">
              <TabsTrigger className="min-h-11" value="monthly">Monthly Payment</TabsTrigger>
              <TabsTrigger className="min-h-11" value="amortization">Amortization Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="monthly">
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--coastal-border)] p-6 shadow-sm">
                <div className="text-center mb-6">
                  <p className="text-sm text-[var(--coastal-muted-text)] mb-1">Estimated Monthly Payment</p>
                  <p className="text-4xl font-bold text-[var(--coastal-text)]">{formatUSD(breakdown.total)}<span className="text-lg font-normal text-[var(--coastal-muted-text)]">/mo</span></p>
                </div>

                <div className="space-y-3">
                  {/* Principal & Interest (requested) */}
                  <Row
                    label="Principal & Interest"
                    color="bg-[var(--coastal-primary)]"
                    value={monthlyPI}
                  />
                  <Row
                    label="Principal (est. first month)"
                    color="bg-[var(--coastal-secondary)]"
                    value={firstMonthPrincipal}
                  />
                  <Row
                    label="Interest (est. first month)"
                    color="bg-emerald-500"
                    value={firstMonthInterest}
                  />
                  {/* Optional extras (kept for context) */}
                  <Row label="Property Tax (1.1%)" color="bg-[var(--coastal-secondary)]" value={breakdown.propertyTax} />
                  <Row label="Home Insurance" color="bg-emerald-500" value={breakdown.insurance} />
                  {breakdown.pmi > 0 && (
                    <Row label="PMI" color="bg-rose-500" value={breakdown.pmi} note="Removed at 20% equity" />
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatUSD(breakdown.total)}/mo</span>
                  </div>

                  {/* Total Interest over life (requested) */}
                  <div className="pt-4 border-t border-white/10 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--coastal-muted-text)] font-semibold">Total Interest (loan life)</span>
                      <span className="text-sm font-bold text-[var(--coastal-text)]">{formatUSD(totalInterestOverLife)}</span>
                    </div>
                  </div>
                </div>

                {/* Distribution bar */}
                <div className="mt-6">
                  <div className="flex h-3 w-full overflow-hidden rounded-full">
                    <div className="bg-[var(--coastal-primary)]" style={{ width: `${pct(breakdown.principalAndInterest, breakdown.total)}%` }} />
                    <div className="bg-[var(--coastal-secondary)]" style={{ width: `${pct(breakdown.propertyTax, breakdown.total)}%` }} />
                    <div className="bg-emerald-500" style={{ width: `${pct(breakdown.insurance, breakdown.total)}%` }} />
                    {breakdown.pmi > 0 && <div className="bg-rose-500" style={{ width: `${pct(breakdown.pmi, breakdown.total)}%` }} />}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="amortization">
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--coastal-border)] p-6 shadow-sm max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[var(--surface)]">
                    <tr className="border-b border-[var(--coastal-border)]">
                      <th className="text-left py-2 font-medium text-[var(--coastal-muted-text)]">Year</th>
                      <th className="text-right py-2 font-medium text-[var(--coastal-muted-text)]">Principal</th>
                      <th className="text-right py-2 font-medium text-[var(--coastal-muted-text)]">Interest</th>
                      <th className="text-right py-2 font-medium text-[var(--coastal-muted-text)]">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortization.map((row) => (
                      <tr key={row.year} className="border-b border-[var(--coastal-border)]/50">
                        <td className="py-2 font-medium">{row.year}</td>
                        <td className="text-right py-2 text-[var(--coastal-primary)]">{formatUSD(row.principalPaid)}</td>
                        <td className="text-right py-2 text-[var(--coastal-muted-text)]">{formatUSD(row.interestPaid)}</td>
                        <td className="text-right py-2 font-medium">{formatUSD(row.endBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function pct(part: number, total: number): number {
  return total > 0 ? (part / total) * 100 : 0
}

function Row({ label, color, value, note }: { label: string; color: string; value: number; note?: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${color}`} />
        <span className="text-sm">{label}</span>
        {note && <span className="text-xs text-[var(--coastal-muted-text)]">({note})</span>}
      </div>
      <span className="font-medium text-sm">{formatUSD(value)}/mo</span>
    </div>
  )
}
