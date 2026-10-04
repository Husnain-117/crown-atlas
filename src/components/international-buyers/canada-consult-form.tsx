"use client"

import { useEffect, useId, useRef, useState } from "react"
import { CONTACT } from "@/lib/constants/contact"
import { trackLeadConversion, trackLeadEvent } from "@/lib/analytics/conversion"
import { buyerTimeZoneOptions, confirmedUkBuyerDelivery } from "@/lib/uk-buyer-inquiry"
import {
  CANADA_CONSULT_BUDGETS,
  CANADA_CONSULT_PURPOSES, CANADA_CONSULT_TIMELINES, canadaConsultSchemaForRegion,
  readCampaignAttribution, campaignAttributionSchema, type CampaignAttribution,
} from "@/lib/canada-consult-inquiry"
import { CANADA_CONSULT_REGIONS, type CanadaConsultRegion } from "@/lib/canada-consult-regions"
import { buildCanadaLanderPayload } from '@/lib/canada-lander'
import { CANADA_LANDER_CTA, CANADA_LANDER_SUCCESS, CANADA_USD_NOTE } from '@/lib/canada-lander-content'

export default function CanadaConsultForm({ region }: { region?: CanadaConsultRegion }) {
  const [selectedRegion, setSelectedRegion] = useState<CanadaConsultRegion | ''>(region || '')
  const activeRegion = region || selectedRegion || 'san-diego'
  const config = CANADA_CONSULT_REGIONS[activeRegion]
  const id = useId()
  const formRef = useRef<HTMLFormElement>(null)
  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  const [step, setStep] = useState<0 | 1>(0)
  const successRef = useRef<HTMLDivElement>(null)
  const startedAt = useRef(Date.now())
  const started = useRef(false)
  const busy = useRef(false)
  const [attribution, setAttribution] = useState<CampaignAttribution>({})
  const [ready, setReady] = useState(false)
  const [zone, setZone] = useState("America/Toronto")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deliveryError, setDeliveryError] = useState(false)
  const analytics = { source: region ? config.source : 'canada_california_hub', kind: "contact" as const }

  useEffect(() => {
    const incoming = readCampaignAttribution(window.location.href)
    let saved: CampaignAttribution = {}
    try {
      const parsed = campaignAttributionSchema.safeParse(JSON.parse(sessionStorage.getItem('canada-lander-attribution') || '{}'))
      if (parsed.success) saved = parsed.data
    } catch { /* Storage may be unavailable. The landing URL still works. */ }
    const campaign = { ...saved, ...incoming }
    setAttribution(campaign)
    try { sessionStorage.setItem('canada-lander-attribution', JSON.stringify(campaign)) } catch { /* Optional persistence. */ }
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (detected) setZone(detected)
    setReady(true)
  }, [])
  useEffect(() => { if (submitted) successRef.current?.focus() }, [submitted])

  function showErrors(next: Record<string, string>) {
    setErrors(next)
    const first = Object.keys(next)[0]
    if (["city", "targetLocation", "purchaseTimeline", "budgetRange"].includes(first)) setStep(0)
    else setStep(1)
    const input = formRef.current?.elements.namedItem(first)
    if (input instanceof HTMLElement) {
      const details = input.closest("details")
      if (details) details.open = true
      requestAnimationFrame(() => input.focus())
    }
  }

  function continueToContact() {
    if (!formRef.current) return
    if (!region && !selectedRegion) { showErrors({ city: 'Choose a California destination.' }); return }
    const data = Object.fromEntries(new FormData(formRef.current))
    const plans = canadaConsultSchemaForRegion(activeRegion).pick({ targetLocation: true, purchaseTimeline: true, budgetRange: true }).safeParse(data)
    if (!plans.success) {
      const next: Record<string, string> = {}
      for (const issue of plans.error.issues) next[String(issue.path[0])] ||= issue.message
      showErrors(next)
      trackLeadEvent("lead_error", { ...analytics, errorCode: "validation_failed" })
      return
    }
    setErrors({})
    setStep(1)
    trackLeadEvent("lead_form_step", { ...analytics, formStep: "contact" })
    requestAnimationFrame(() => stepHeadingRef.current?.focus())
  }

  function field(name: string) {
    return { id: `${id}-${name}`, name, "aria-invalid": Boolean(errors[name]), "aria-describedby": [name === 'budgetRange' ? `${id}-budget-hint` : '', errors[name] ? `${id}-${name}-error` : ''].filter(Boolean).join(' ') || undefined }
  }
  function error(name: string) { return errors[name] ? <p id={`${id}-${name}-error`} className="consult-error">{errors[name]}</p> : null }
  function select(name: string, label: string, options: readonly string[]) {
    return <div><label htmlFor={`${id}-${name}`}>{label} <span>(required)</span></label><select key={name === 'targetLocation' || name === 'propertyPurpose' ? `${activeRegion}-${name}` : name} {...field(name)} required defaultValue=""><option value="">Choose an option</option>{options.map(option => <option key={option}>{option}</option>)}</select>{error(name)}</div>
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy.current) return
    if (String(new FormData(event.currentTarget).get('company') || '').trim()) return
    if (step === 0) { continueToContact(); return }
    const data = new FormData(event.currentTarget)
    const parsed = canadaConsultSchemaForRegion(activeRegion).safeParse({ ...Object.fromEntries(data), consent: data.get("consent") === "on" })
    setDeliveryError(false)
    if (!parsed.success) {
      const next: Record<string, string> = {}
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ||= issue.message
      showErrors(next)
      trackLeadEvent("lead_error", { ...analytics, errorCode: "validation_failed" })
      return
    }
    setErrors({})
    busy.current = true
    setSubmitting(true)
    trackLeadEvent("lead_submit", analytics)
    try {
      const payload = buildCanadaLanderPayload(parsed.data, { pageUrl: window.location.href, attribution, elapsedMs: Date.now() - startedAt.current, company: String(data.get("company") || "") }, activeRegion)
      const response = await fetch("/api/canada-lander", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      const body: unknown = await response.json().catch(() => null)
      if (!confirmedUkBuyerDelivery(response.ok, body)) throw new Error("Delivery was not confirmed")
      trackLeadConversion(analytics)
      setSubmitted(true)
    } catch {
      setDeliveryError(true)
      trackLeadEvent("lead_error", { ...analytics, errorCode: "request_failed" })
    } finally { busy.current = false; setSubmitting(false) }
  }

  return <section id="enquire" className="canada-consult-form" aria-labelledby={`${id}-heading`} lang="en-CA">
    <p className="consult-eyebrow">20-MINUTE BUYER CONSULTATION</p>
    <h2 id={`${id}-heading`}>Let’s plan your {region ? config.label : 'California'} purchase.</h2>
    <p>20 minutes, time agreed by email. Start with your buying plans, then tell Reza where to reply.</p>
    {submitted ? <div ref={successRef} tabIndex={-1} role="status" className="consult-success"><h3>Your enquiry has been delivered.</h3><p>{CANADA_LANDER_SUCCESS}</p></div> : <form ref={formRef} onSubmit={submit} noValidate aria-busy={submitting} onFocusCapture={() => { if (!started.current) { started.current = true; trackLeadEvent("lead_form_start", analytics) } }}>
      {Object.entries(attribution).map(([name, value]) => <input key={name} type="hidden" name={name} value={value || ''} readOnly />)}
      <div hidden aria-hidden="true"><label htmlFor={`${id}-company`}>Company</label><input id={`${id}-company`} name="company" tabIndex={-1} autoComplete="off" /></div>
      <fieldset disabled={submitting}>
        <legend className="sr-only">Your {config.label} consultation request</legend>
        <div className="consult-progress" aria-live="polite"><span>Step {step + 1} of 2</span><span>{step === 0 ? "Your buying plans" : "Your contact details"}</span></div>
        <h3 ref={stepHeadingRef} tabIndex={-1} className="consult-step-heading">{step === 0 ? "Where and when would you like to buy?" : "How can Reza reach you?"}</h3>
        <div className="consult-step" hidden={step !== 0}>
          {!region && <div><label htmlFor={`${id}-city`}>California destination <span>(required)</span></label><select {...field('city')} required value={selectedRegion} onChange={event => setSelectedRegion(event.target.value as CanadaConsultRegion | '')}><option value="">Choose a destination</option>{(Object.keys(CANADA_CONSULT_REGIONS) as CanadaConsultRegion[]).map(city => <option key={city} value={city}>{CANADA_CONSULT_REGIONS[city].label}</option>)}</select>{error('city')}</div>}
          {select("targetLocation", "Preferred area", config.areas)}
          {select("purchaseTimeline", "When would you like to buy?", CANADA_CONSULT_TIMELINES)}
          {select("budgetRange", "Purchase budget (USD)", CANADA_CONSULT_BUDGETS)}
          <p id={`${id}-budget-hint`} className="consult-hint">{CANADA_USD_NOTE}</p>
          <button type="button" className="uk-funnel-button" onClick={continueToContact} disabled={!ready}>Continue to contact details</button>
          <p className="consult-hint">Your enquiry is sent after step 2.</p>
        </div>
        <div className="consult-step" hidden={step !== 1}>
          <div><label htmlFor={`${id}-name`}>Full name <span>(required)</span></label><input {...field("name")} required autoComplete="name" maxLength={160} />{error("name")}</div>
          <div><label htmlFor={`${id}-email`}>Email <span>(required)</span></label><input {...field("email")} required type="email" autoComplete="email" maxLength={254} />{error("email")}</div>
          {select("propertyPurpose", "How will you use the home?", [`Moving to ${config.label}`, ...CANADA_CONSULT_PURPOSES.slice(1)])}
        <details><summary>Add contact details or a question (optional)</summary><div className="consult-extra">
          <div><label htmlFor={`${id}-phone`}>Phone with country code (optional)</label><input {...field("phone")} type="tel" autoComplete="tel" placeholder="+1 416 555 0100" maxLength={60} />{error("phone")}</div>
          <div><label htmlFor={`${id}-timeZone`}>Your time zone</label><select {...field("timeZone")} value={zone} onChange={event => setZone(event.target.value)}>{buyerTimeZoneOptions("canada", zone).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{error("timeZone")}</div>
          <div><label htmlFor={`${id}-message`}>Your question or preferred times (optional)</label><textarea {...field("message")} rows={3} maxLength={1000} />{error("message")}</div>
        </div></details>
        <div><label className="consult-consent" htmlFor={`${id}-consent`}><input {...field("consent")} type="checkbox" required /><span>I agree to be contacted about this consultation. Read our <a href="/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a>.</span></label>{error("consent")}</div>
        {deliveryError && <p role="alert" className="consult-error">We could not confirm delivery. Your details are still here. Please try again or email <a href={CONTACT.email.href}>{CONTACT.email.display}</a>.</p>}
        <button type="submit" className="uk-funnel-button" disabled={!ready || submitting}>{submitting ? "Sending your enquiry…" : CANADA_LANDER_CTA}</button>
          <button type="button" className="consult-back" onClick={() => { setStep(0); requestAnimationFrame(() => stepHeadingRef.current?.focus()) }}>Back to your buying plans</button>
          <p className="consult-hint">Reza replies to arrange a time. This request does not book an appointment.</p>
        </div>
        <noscript><p>Please enable JavaScript or <a href={CONTACT.email.href}>email us directly</a>.</p></noscript>
      </fieldset>
    </form>}
    <p className="consult-form-identity">{CONTACT.agent.name} · DRE #{CONTACT.agent.dre}<br />Crown Coastal Homes · eXp of California</p>
  </section>
}
