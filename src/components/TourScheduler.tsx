"use client"

import { useEffect, useId, useRef, useState } from "react"
import TourPreferences from "@/components/forms/tour-preferences"
import { CONTACT } from "@/lib/constants/contact"
import { isInternationalPhone } from "@/lib/contact-context"
import { trackLeadConversion, trackLeadEvent } from "@/lib/analytics/conversion"

const fieldClass = "mt-1 min-h-11 w-full rounded-lg border border-[var(--coastal-border)] bg-[var(--surface-muted)] px-3 text-[var(--coastal-text)]"

export default function TourScheduler({ propertyAddress, propertyKey }: { propertyAddress: string; propertyKey: string }) {
  const formId = useId()
  const [busy, setBusy] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const startedAtRef = useRef(Date.now())
  const formStartedTrackedRef = useRef(false)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (submitted) successRef.current?.focus()
  }, [submitted])

  function eventOptions() {
    return { source: "property-tour-scheduler", kind: "tour" as const, hasPropertyContext: Boolean(propertyKey || propertyAddress), listingKey: propertyKey }
  }

  function trackFormStart() {
    if (formStartedTrackedRef.current) return
    formStartedTrackedRef.current = true
    trackLeadEvent("lead_form_start", eventOptions())
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError(null)
    const fields = new FormData(event.currentTarget)
    const phone = String(fields.get("phone") || "").trim()
    if (!isInternationalPhone(phone)) {
      setError("Please enter a phone number with a country code, or leave it blank.")
      trackLeadEvent("lead_error", { ...eventOptions(), errorCode: "validation_failed" })
      return
    }
    const payload = {
      name: String(fields.get("name") || "").trim(),
      email: String(fields.get("email") || "").trim(),
      phone,
      message: String(fields.get("message") || "").trim(),
      mode: "tour",
      tourType: String(fields.get("tourType") || "in-person"),
      preferredDate: String(fields.get("preferredDate") || ""),
      preferredTime: String(fields.get("preferredTime") || ""),
      timeZone: String(fields.get("timeZone") || "America/Los_Angeles"),
      propertyData: { listing_key: propertyKey, address: propertyAddress },
      pageUrl: window.location.href,
      company: String(fields.get("company") || ""),
      __top: Date.now() - startedAtRef.current,
    }
    setBusy(true)
    trackLeadEvent("lead_submit", eventOptions())
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.success || !result.requestId) {
        throw new Error(result.error || "We could not confirm delivery. Please try again or contact us directly.")
      }
      trackLeadConversion(eventOptions())
      setSubmitted(true)
    } catch (failure) {
      trackLeadEvent("lead_error", { ...eventOptions(), errorCode: "request_failed" })
      setError(failure instanceof Error ? failure.message : "We could not send the tour request.")
    } finally {
      setBusy(false)
    }
  }

  if (submitted) {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="rounded-xl border border-[var(--coastal-border)] bg-[var(--surface)] p-6 focus:outline-none focus:ring-2 focus:ring-[var(--coastal-primary)]">
        <h3 className="text-lg font-semibold text-[var(--coastal-text)]">Your tour request was delivered</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--coastal-muted-text)]">Reza will review your request for {propertyAddress || `Listing ID: ${propertyKey}`} and confirm the tour format, date and time zone with you. An appointment is confirmed only after you hear back.</p>
        <a href={CONTACT.phone.href} className="mt-3 inline-flex min-h-11 items-center text-sm underline">Call {CONTACT.phone.display}</a>
      </div>
    )
  }

  return (
    <form onSubmit={submit} onFocusCapture={trackFormStart} className="tour-scheduler-form space-y-4 rounded-xl border border-[var(--coastal-border)] bg-[var(--surface)] p-4 shadow-sm" aria-busy={busy}>
      <h3 className="text-base font-semibold text-[var(--coastal-text)]">Request a property tour</h3>
      <p className="text-sm text-[var(--coastal-muted-text)]">{propertyAddress || `Listing ID: ${propertyKey}`}</p>
      <fieldset disabled={busy} className="space-y-4">
        <legend className="sr-only">Tour request and contact details</legend>
        <TourPreferences idPrefix={`property-tour-${formId}`} />
        <div className="sr-only" aria-hidden="true">
          <label htmlFor={`${formId}-company`}>Company</label>
          <input id={`${formId}-company`} name="company" tabIndex={-1} autoComplete="off" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label htmlFor={`${formId}-name`} className="block text-sm text-[var(--coastal-text)]">
            Full name
            <input id={`${formId}-name`} name="name" required minLength={2} maxLength={160} autoComplete="name" className={fieldClass} />
          </label>
          <label htmlFor={`${formId}-email`} className="block text-sm text-[var(--coastal-text)]">
            Email
            <input id={`${formId}-email`} name="email" required type="email" maxLength={254} autoComplete="email" className={fieldClass} />
          </label>
        </div>
        <label htmlFor={`${formId}-phone`} className="block text-sm text-[var(--coastal-text)]">
          Phone (optional)
          <input id={`${formId}-phone`} name="phone" type="tel" maxLength={60} autoComplete="tel" placeholder="Include country code, e.g. +44" className={fieldClass} />
        </label>
        <label htmlFor={`${formId}-message`} className="block text-sm text-[var(--coastal-text)]">
          Message (optional)
          <textarea id={`${formId}-message`} name="message" maxLength={5000} rows={3} placeholder="Anything you would like us to check during the viewing?" className={`${fieldClass} py-2`} />
        </label>
        {error && <p role="alert" className="text-sm text-[var(--error)]">{error}{" "}<a href={CONTACT.phone.href} className="underline">Call {CONTACT.phone.display}</a>.</p>}
        <button type="submit" disabled={busy} className="tour-submit-btn min-h-11 w-full rounded-lg bg-[var(--coastal-primary)] px-4 py-3 font-semibold text-white disabled:opacity-60">
          {busy ? "Sending request..." : "Request tour"}
        </button>
      </fieldset>
      <p className="text-xs text-[var(--coastal-muted-text)]">By submitting, you agree to be contacted about this request. Read our{" "}<a href="/privacy" className="underline">privacy policy</a>.</p>
    </form>
  )
}
