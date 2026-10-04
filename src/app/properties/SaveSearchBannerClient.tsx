"use client"

import Link from "next/link"
import { useState } from "react"
import { CheckCircle2, X } from "lucide-react"

interface SaveSearchBannerClientProps {
  filters: Record<string, unknown>
  resultCount: number
}

function optionalNumber(value: unknown): number | undefined {
  if (value === "" || value === null || value === undefined) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

function normalizeAlertFilters(filters: Record<string, unknown>) {
  const action = filters.status === "for_rent" || filters.propertyType === "ResidentialLease"
    ? "rent"
    : "buy"

  return {
    city: typeof filters.city === "string" ? filters.city : undefined,
    county: typeof filters.county === "string" ? filters.county : undefined,
    neighborhood: typeof filters.neighborhood === "string" ? filters.neighborhood : undefined,
    minPrice: optionalNumber(filters.minPrice),
    maxPrice: optionalNumber(filters.maxPrice),
    beds: optionalNumber(filters.beds),
    baths: optionalNumber(filters.baths),
    minSqft: optionalNumber(filters.minSqft),
    maxSqft: optionalNumber(filters.maxSqft),
    minLot: optionalNumber(filters.minLot),
    maxLot: optionalNumber(filters.maxLot),
    minYear: optionalNumber(filters.minYear),
    maxYear: optionalNumber(filters.maxYear),
    maxHoa: optionalNumber(filters.maxHoa),
    hasGarage: filters.hasGarage === true,
    hasPool: filters.hasPool === true,
    isWaterfront: filters.isWaterfront === true,
    priceReduced: filters.priceReduced === true,
    openHouseDate: typeof filters.openHouseDate === "string" ? filters.openHouseDate : undefined,
    propertyType: typeof filters.propertyType === "string" && filters.propertyType !== "all"
      ? filters.propertyType
      : undefined,
    propertyCategory: ["house", "condo", "townhouse", "manufactured"].includes(String(filters.propertyCategory))
      ? String(filters.propertyCategory)
      : undefined,
    keywords: typeof filters.keywords === "string" ? filters.keywords : undefined,
    action,
  }
}

export function SaveSearchBannerClient({ filters, resultCount }: SaveSearchBannerClientProps) {
  const [email, setEmail] = useState("")
  const [label, setLabel] = useState("")
  const [company, setCompany] = useState("")
  const [startedAt] = useState(() => Date.now())
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [open, setOpen] = useState(true)

  if (!open) return null

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || loading) return

    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/save-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          label: label.trim() || undefined,
          filters: normalizeAlertFilters(filters),
          company,
          __top: Date.now() - startedAt,
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "The alert could not be created. Please try again.")
      }
      setSaved(true)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The alert could not be created. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (saved) {
    return (
      <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
        <span className="flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
          Daily alert created. You can unsubscribe from any alert email.
        </span>
        <button type="button" onClick={() => setOpen(false)} className="min-h-11 min-w-11 p-2" aria-label="Dismiss alert confirmation">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <section className="mb-4 rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] px-4 py-4 sm:px-5" aria-labelledby="save-search-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="save-search-title" className="font-semibold text-[var(--coastal-text)]">
            Get a daily listing alert
          </h2>
          <p className="mt-1 text-sm text-[var(--coastal-muted-text)]">
            {resultCount > 0
              ? `${resultCount.toLocaleString("en-US")} current result${resultCount === 1 ? "" : "s"} match. We will email new CRMLS matches for these criteria.`
              : "There are no current matches. We will email you when a new CRMLS listing meets these criteria."}
          </p>
        </div>
        <button type="button" onClick={() => setOpen(false)} className="min-h-11 min-w-11 p-2 text-[var(--coastal-muted-text)] hover:text-[var(--coastal-text)]" aria-label="Dismiss listing alert form">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSave} className="mt-4">
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <label className="sr-only" htmlFor="listing-alert-email">Email address</label>
          <input
            id="listing-alert-email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-h-11 w-full rounded-md border border-[var(--coastal-border)] bg-[var(--surface)] px-3 text-base text-[var(--coastal-text)]"
          />
          <label className="sr-only" htmlFor="listing-alert-label">Alert name</label>
          <input
            id="listing-alert-label"
            maxLength={160}
            placeholder="Alert name (optional)"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="min-h-11 w-full rounded-md border border-[var(--coastal-border)] bg-[var(--surface)] px-3 text-base text-[var(--coastal-text)]"
          />
          <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="listing-alert-company">Company</label>
            <input id="listing-alert-company" tabIndex={-1} autoComplete="off" value={company} onChange={(event) => setCompany(event.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="min-h-11 rounded-md bg-[var(--coastal-primary)] px-5 font-semibold text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Creating..." : "Create Alert"}
          </button>
        </div>
        {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
        <p className="mt-2 text-xs leading-5 text-[var(--coastal-muted-text)]">
          By creating an alert, you agree to receive daily matching-listing emails. See our <Link href="/privacy" className="underline hover:text-[var(--coastal-primary)]">privacy policy</Link>.
        </p>
      </form>
    </section>
  )
}
