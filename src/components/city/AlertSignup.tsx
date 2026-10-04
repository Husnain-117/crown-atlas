"use client"

import { useId, useState } from "react"

interface Props {
  city: string
  county: string
  action: "buy" | "rent"
}

export default function AlertSignup({ city, county, action }: Props) {
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [start] = useState(() => Date.now())
  const emailId = useId()
  const helpId = `${emailId}-help`

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const payload = {
      email: fd.get("email"),
      __top: Date.now() - start,
      company: fd.get("company"),
      label: `${action === "buy" ? "Homes for sale" : "Rentals"} in ${city}`,
      filters: { city, county, action },
    }
    try {
      const r = await fetch("/api/save-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok && r.status !== 409) throw new Error(j?.message || j?.error || "Submit failed")
      setOk(true)
    } catch (e: any) {
      setError(e?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  if (ok) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
        Listing alerts are active for {city}. You can unsubscribe from any alert email.
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input name="company" className="sr-only" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor={emailId} className="mb-1 block text-sm font-medium text-[var(--coastal-text)]">
            Email
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            required
            aria-describedby={helpId}
            placeholder="you@email.com"
            className="min-h-11 w-full rounded-md border border-[var(--coastal-border)] bg-[var(--surface)] px-3 py-2 text-[var(--coastal-text)]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="min-h-11 shrink-0 rounded-md bg-[var(--coastal-primary)] px-5 py-2 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Saving..." : "Get Alerts"}
        </button>
      </div>
      {error && <div className="text-sm text-red-600" role="alert">{error}</div>}
      <p id={helpId} className="text-xs leading-relaxed text-[var(--coastal-muted-text)]">
        By subscribing, you agree to receive matching listing emails. Unsubscribe at any time.
      </p>
    </form>
  )
}
