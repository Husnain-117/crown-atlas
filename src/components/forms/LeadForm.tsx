"use client"

import Link from "next/link"
import { useId, useRef, useState } from "react"
import { trackLeadConversion, trackLeadEvent } from "@/lib/analytics/conversion"

type LeadFormDefaults = {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  message?: string
  city?: string
  state?: string
  county?: string
  neighborhood?: string
  budgetMax?: number
  timeframe?: "now" | "30d" | "90d" | "later"
  wantsTour?: boolean
  source?: string
}

export default function LeadForm({ defaults }: { defaults?: LeadFormDefaults }) {
  const [loading, setLoading] = useState(false)
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [start] = useState(() => Date.now())
  const formStartedTrackedRef = useRef(false)
  const id = useId()
  const leadSource = defaults?.source || "website-lead-form"

  function trackFormStart() {
    if (formStartedTrackedRef.current) return
    formStartedTrackedRef.current = true
    trackLeadEvent("lead_form_start", { source: leadSource })
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErr(null)
    const fd = new FormData(e.currentTarget)
    const payload = {
      ...Object.fromEntries(fd),
      wantsTour: fd.get("wantsTour") === "on",
      tags: defaults?.neighborhood
        ? ["buyer-inquiry", `neighborhood:${defaults.neighborhood}`]
        : ["buyer-inquiry"],
      source: leadSource,
      pageUrl: window.location.href,
      __top: Date.now() - start,
    }
    const leadKind = payload.wantsTour ? "tour" as const : "lead" as const
    trackLeadEvent("lead_submit", { source: leadSource, kind: leadKind })
    try {
      const r = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok || !j.success) throw new Error(j?.error || 'We could not send your request. Please try again.')
      trackLeadConversion({
        source: leadSource,
        kind: leadKind,
      })
      setOk(true)
    } catch (e: any) {
      trackLeadEvent("lead_error", {
        source: leadSource,
        kind: leadKind,
        errorCode: "request_failed",
      })
      setErr(e?.message || 'We could not send your request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (ok) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-4 text-green-800" role="status">
        Thanks. Your request was delivered, and the team will follow up using the details you provided.
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} onFocusCapture={trackFormStart} className="grid gap-4">
      <input name="company" className="hidden" tabIndex={-1} autoComplete="off" />
      <input name="city" type="hidden" value={defaults?.city || ""} />
      <input name="state" type="hidden" value={defaults?.state || ""} />

      <div>
        <label htmlFor={`${id}-firstName`} className="block text-sm font-medium text-[var(--coastal-text)] mb-1">
          First Name
        </label>
        <input
          id={`${id}-firstName`}
          name="firstName"
          type="text"
          autoComplete="given-name"
          defaultValue={defaults?.firstName}
          className="h-11 w-full rounded-md border border-[var(--coastal-border)] bg-white px-3"
          required
        />
      </div>

      <div>
        <label htmlFor={`${id}-lastName`} className="block text-sm font-medium text-[var(--coastal-text)] mb-1">
          Last Name
        </label>
        <input
          id={`${id}-lastName`}
          name="lastName"
          type="text"
          autoComplete="family-name"
          defaultValue={defaults?.lastName}
          className="h-11 w-full rounded-md border border-[var(--coastal-border)] bg-white px-3"
          required
        />
      </div>

      <div>
        <label htmlFor={`${id}-email`} className="block text-sm font-medium text-[var(--coastal-text)] mb-1">
          Email
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={defaults?.email}
          className="h-11 w-full rounded-md border border-[var(--coastal-border)] bg-white px-3"
          required
        />
      </div>

      <div>
        <label htmlFor={`${id}-phone`} className="block text-sm font-medium text-[var(--coastal-text)] mb-1">
          Phone
        </label>
        <input
          id={`${id}-phone`}
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={defaults?.phone}
          className="h-11 w-full rounded-md border border-[var(--coastal-border)] bg-white px-3"
        />
      </div>

      <div>
        <label htmlFor={`${id}-message`} className="block text-sm font-medium text-[var(--coastal-text)] mb-1">
          Tell us what you're looking for
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={3}
          defaultValue={defaults?.message}
          className="w-full rounded-md border border-[var(--coastal-border)] bg-white p-3"
        />
      </div>


      <div>
        <label htmlFor={`${id}-county`} className="block text-sm font-medium text-[var(--coastal-text)] mb-1">
          County
        </label>
        <input
          id={`${id}-county`}
          name="county"
          type="text"
          defaultValue={defaults?.county}
          className="h-11 w-full rounded-md border border-[var(--coastal-border)] bg-white px-3"
        />
      </div>

      <div>
        <label htmlFor={`${id}-budgetMax`} className="block text-sm font-medium text-[var(--coastal-text)] mb-1">
          Budget Max
        </label>
        <input
          id={`${id}-budgetMax`}
          name="budgetMax"
          type="number"
          placeholder="e.g., 750000"
          defaultValue={defaults?.budgetMax}
          min={0}
          className="h-11 w-full rounded-md border border-[var(--coastal-border)] bg-white px-3"
        />
      </div>

      <div>
        <label htmlFor={`${id}-timeframe`} className="block text-sm font-medium text-[var(--coastal-text)] mb-1">
          Timeframe
        </label>
        <select
          id={`${id}-timeframe`}
          name="timeframe"
          className="h-11 w-full rounded-md border border-[var(--coastal-border)] bg-white px-3"
          defaultValue={defaults?.timeframe || "30d"}
        >
          <option value="now">Buying now</option>
          <option value="30d">Within 30 days</option>
          <option value="90d">Within 90 days</option>
          <option value="later">Later</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id={`${id}-wantsTour`} name="wantsTour" defaultChecked={defaults?.wantsTour} />
        <label htmlFor={`${id}-wantsTour`} className="text-sm text-[var(--coastal-text)]">
          I want a tour
        </label>
      </div>

      {err && <div className="text-sm text-red-700" role="alert">{err}</div>}

      <div className="space-y-2">
        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-md bg-[var(--coastal-primary)] px-4 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Request Listings'}
        </button>
        <p className="text-xs text-[var(--coastal-muted-text)] text-center">
          By submitting, you agree to be contacted about this inquiry. See our{' '}
          <Link href="/privacy" className="underline hover:text-[var(--coastal-primary)]">
            privacy policy
          </Link>.
        </p>
      </div>
    </form>
  )
}
