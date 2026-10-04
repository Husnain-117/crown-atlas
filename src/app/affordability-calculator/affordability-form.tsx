"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { DollarSign, TrendingUp, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { computeMonthlyPI, formatUSD, CA_PROPERTY_TAX_RATE, DEFAULT_INSURANCE_MONTHLY, PMI_ANNUAL_RATE } from "@/lib/mortgage-calc"

const CREDIT_TIERS = [
  { label: "Excellent (740+)", rate: 6.25 },
  { label: "Good (680–739)", rate: 6.75 },
  { label: "Fair (620–679)", rate: 7.5 },
] as const

const DTI_MAX = 0.36

export default function AffordabilityForm() {
  const [annualIncome, setAnnualIncome] = useState(150000)
  const [monthlyDebt, setMonthlyDebt] = useState(500)
  const [downPaymentSavings, setDownPaymentSavings] = useState(100000)
  const [creditTier, setCreditTier] = useState(0)

  const result = useMemo(() => {
    const rate = CREDIT_TIERS[creditTier].rate
    const monthlyIncome = annualIncome / 12
    const maxMonthlyPITI = monthlyIncome * DTI_MAX - monthlyDebt
    if (maxMonthlyPITI <= 0) return null

    // Iterative solve: find max home price where PITI <= maxMonthlyPITI
    // Assume down = downPaymentSavings as fixed $ (not percent)
    // Start from a guess and refine
    let lo = 0
    let hi = 20_000_000
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2
      const down = Math.min(downPaymentSavings, mid * 0.5)
      const loan = mid - down
      const pi = computeMonthlyPI(loan, rate, 30)
      const tax = (mid * CA_PROPERTY_TAX_RATE) / 12
      const ins = DEFAULT_INSURANCE_MONTHLY
      const pmi = (down / mid) < 0.2 ? (loan * PMI_ANNUAL_RATE) / 12 : 0
      const total = pi + tax + ins + pmi
      if (total <= maxMonthlyPITI) lo = mid
      else hi = mid
    }

    const maxPrice = Math.round(lo / 1000) * 1000
    if (maxPrice <= 0) return null

    const down = Math.min(downPaymentSavings, maxPrice * 0.5)
    const loan = maxPrice - down
    const pi = computeMonthlyPI(loan, CREDIT_TIERS[creditTier].rate, 30)
    const tax = (maxPrice * CA_PROPERTY_TAX_RATE) / 12
    const pmi = (down / maxPrice) < 0.2 ? (loan * PMI_ANNUAL_RATE) / 12 : 0
    const totalMonthly = pi + tax + DEFAULT_INSURANCE_MONTHLY + pmi
    const recommendedLow = Math.round(maxPrice * 0.85 / 1000) * 1000
    const downPct = maxPrice > 0 ? ((down / maxPrice) * 100).toFixed(0) : "0"

    return { maxPrice, totalMonthly, recommendedLow, downPct, loanAmount: loan }
  }, [annualIncome, monthlyDebt, downPaymentSavings, creditTier])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <Field
            label="Annual Household Income"
            icon={<DollarSign className="h-4 w-4 text-[var(--coastal-primary)]" />}
            value={annualIncome}
            onChange={setAnnualIncome}
          />
          <Field
            label="Monthly Debt Payments"
            icon={<DollarSign className="h-4 w-4 text-[var(--coastal-primary)]" />}
            value={monthlyDebt}
            onChange={setMonthlyDebt}
            hint="Car, student loans, credit cards"
          />
          <Field
            label="Down Payment Savings"
            icon={<DollarSign className="h-4 w-4 text-[var(--coastal-primary)]" />}
            value={downPaymentSavings}
            onChange={setDownPaymentSavings}
          />

          <div>
            <label className="text-sm font-medium text-[var(--coastal-text)] mb-2 block">Credit Score Range</label>
            <div className="flex flex-col gap-2">
              {CREDIT_TIERS.map((tier, i) => (
                <button
                  key={tier.label}
                  type="button"
                  onClick={() => setCreditTier(i)}
                  className={`min-h-11 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all text-left ${
                    creditTier === i
                      ? "bg-[var(--coastal-primary)] text-white border-[var(--coastal-primary)]"
                      : "bg-[var(--surface)] text-[var(--coastal-text)] border-[var(--coastal-border)] hover:border-[var(--coastal-primary)]"
                  }`}
                >
                  {tier.label} <span className="text-xs opacity-75">~ {tier.rate}% rate</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {result ? (
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--coastal-border)] p-6 shadow-sm space-y-6">
              <div className="text-center">
                <p className="text-sm text-[var(--coastal-muted-text)] mb-1">You can likely afford up to</p>
                <p className="text-4xl font-bold text-[var(--coastal-primary)]">{formatUSD(result.maxPrice)}</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--coastal-muted-text)]">Down payment ({result.downPct}%)</span>
                  <span className="font-medium">{formatUSD(Math.min(downPaymentSavings, result.maxPrice * 0.5))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--coastal-muted-text)]">Loan amount</span>
                  <span className="font-medium">{formatUSD(result.loanAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-[var(--coastal-muted-text)]">Est. monthly payment</span>
                  <span className="font-semibold text-[var(--coastal-text)]">{formatUSD(result.totalMonthly)}/mo</span>
                </div>
              </div>

              <div className="bg-[var(--surface-muted)] rounded-xl p-4 text-sm">
                <p className="font-medium text-[var(--coastal-text)] mb-1 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-[var(--coastal-primary)]" />
                  Recommended price range
                </p>
                <p className="text-[var(--coastal-muted-text)]">
                  {formatUSD(result.recommendedLow)} &ndash; {formatUSD(result.maxPrice)}
                </p>
              </div>

              <Link
                href={`/properties?minPrice=${result.recommendedLow}&maxPrice=${result.maxPrice}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-[var(--coastal-primary)] text-white font-semibold hover:opacity-90 transition-opacity"
              >
                <Search className="h-4 w-4" />
                Search homes in your range
              </Link>

              <p className="text-xs text-[var(--coastal-muted-text)] text-center">
                Based on {DTI_MAX * 100}% debt-to-income ratio. For a precise budget, get{" "}
                <Link href="/contact?subject=pre-approval" className="text-[var(--coastal-primary)] hover:underline">pre-approved</Link>.
              </p>
            </div>
          ) : (
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--coastal-border)] p-8 text-center">
              <p className="text-lg font-semibold text-[var(--coastal-text)] mb-2">Adjust your inputs</p>
              <p className="text-sm text-[var(--coastal-muted-text)]">
                Your current debt-to-income ratio is too high. Try increasing income or reducing monthly debt.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  icon,
  value,
  onChange,
  hint,
}: {
  label: string
  icon: React.ReactNode
  value: number
  onChange: (v: number) => void
  hint?: string
}) {
  return (
    <div>
      <label className="text-sm font-medium text-[var(--coastal-text)] flex items-center gap-1.5 mb-2">
        {icon} {label}
      </label>
      <Input
        type="text"
        inputMode="numeric"
        value={value.toLocaleString()}
        onChange={(e) => {
          const v = parseInt(e.target.value.replace(/\D/g, "")) || 0
          onChange(v)
        }}
        className="h-11"
      />
      {hint && <p className="text-xs text-[var(--coastal-muted-text)] mt-1">{hint}</p>}
    </div>
  )
}
