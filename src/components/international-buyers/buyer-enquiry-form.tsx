"use client"

import { useEffect, useId, useRef, useState } from "react"
import { CONTACT } from "@/lib/constants/contact"
import { trackLeadConversion, trackLeadEvent } from "@/lib/analytics/conversion"
import {
  UK_BUYER_BUDGETS,
  UK_BUYER_CONTACT_PREFERENCES,
  UK_BUYER_REGIONS,
  UK_BUYER_TIMELINES,
  BUYER_MARKET_CONFIG,
  BUYER_LANGUAGES,
  buildBuyerInquiryPayload,
  buyerDeliveryError,
  buyerInquirySchemaForMarket,
  buyerOptionLabel,
  buyerTimeZoneOptions,
  confirmedUkBuyerDelivery,
  resolveUkBuyerRegion,
  type BuyerMarket,
  type UkBuyerField,
} from "@/lib/uk-buyer-inquiry"

const inputClass = "uk-funnel-input mt-2 min-h-11 w-full rounded-lg border border-[#b6c3c4] bg-white px-3 py-2 text-base text-[#173b47] placeholder:text-[#65767b] focus:outline-none focus:ring-2 focus:ring-[#173b47] focus:ring-offset-2"
const labelClass = "uk-funnel-label block text-sm font-medium text-[#173b47]"
const inputStyle = { backgroundColor: "#fff", color: "#173b47", fontSize: "16px", minHeight: "44px" }

const englishCopy = {
  heading: "Let’s plan your California search",
  successHeading: "Your enquiry has been delivered",
  successBody: "Reza will review your plans and reply using the details you provided. If you requested a video call, you’ll agree a time and time zone together.",
  successNext: "For your first conversation, think about how you plan to use the home, the areas you like and your intended timing.",
  guide: "Read the buying-from-abroad guide",
  company: "Company",
  legend: "Your California home enquiry",
  name: "Full name",
  email: "Email",
  required: "(required)",
  optional: "(optional)",
  region: "Where are you considering?",
  targetLocation: "City or neighbourhood (optional)",
  language: "Preferred language of support",
  languageHint: "Tell us your preference. Confirm who can provide support in that language before arranging services.",
  timeline: "When would you like to buy?",
  chooseTimeline: "Choose a timeline",
  details: "Add a few details (optional)",
  budget: "Approximate purchase budget (USD)",
  discussBudget: "Prefer to discuss",
  phone: "Phone, including country code (optional)",
  preference: "How would you prefer to start?",
  timeZone: "Your time zone",
  travel: "If you’ll be travelling, let us know in your message. We’ll confirm a suitable time together.",
  message: "Anything else you’d like us to know? (optional)",
  messagePlaceholder: "How you plan to use the home, questions, or preferred times to talk.",
  noScript: "Please enable JavaScript to send this form, or",
  directEmail: "email Reza directly",
  sending: "Sending your enquiry…",
  submit: "Discuss my California search",
  consent: "By sending this form, you agree to be contacted about your enquiry. Read our",
  privacy: "privacy policy",
}

const germanCopy: typeof englishCopy = {
  heading: "Planen wir Ihre Immobiliensuche in Kalifornien",
  successHeading: "Ihre Anfrage wurde zugestellt",
  successBody: "Reza prüft Ihre Angaben und meldet sich über die von Ihnen angegebenen Kontaktdaten. Falls Sie ein Videogespräch wünschen, stimmen Sie Termin und Zeitzone gemeinsam ab.",
  successNext: "Überlegen Sie für das erste Gespräch, wie Sie die Immobilie nutzen möchten, welche Regionen Sie interessieren und wann Sie kaufen möchten.",
  guide: "Leitfaden zum Kauf aus dem Ausland lesen (auf Englisch)",
  company: "Unternehmen",
  legend: "Ihre Anfrage zum Immobilienkauf in Kalifornien",
  name: "Vollständiger Name",
  email: "E-Mail-Adresse",
  required: "(Pflichtfeld)",
  optional: "(optional)",
  region: "Welche Region interessiert Sie?",
  targetLocation: "Stadt oder Stadtteil (optional)",
  language: "Gewünschte Sprache der Begleitung",
  languageHint: "Teilen Sie uns Ihren Wunsch mit. Klären Sie im Erstgespräch, wer Sie in dieser Sprache begleiten kann.",
  timeline: "Wann möchten Sie kaufen?",
  chooseTimeline: "Zeitraum auswählen",
  details: "Weitere Angaben ergänzen (optional)",
  budget: "Ungefähres Kaufbudget (US-Dollar)",
  discussBudget: "Im Gespräch klären",
  phone: "Telefonnummer mit Ländervorwahl (optional)",
  preference: "Wie möchten Sie den Kontakt beginnen?",
  timeZone: "Ihre Zeitzone",
  travel: "Falls Sie auf Reisen sind, teilen Sie uns dies in Ihrer Nachricht mit. Einen passenden Termin stimmen wir gemeinsam ab.",
  message: "Was möchten Sie uns noch mitteilen? (optional)",
  messagePlaceholder: "Geplante Nutzung der Immobilie, Ihre Fragen oder bevorzugte Gesprächszeiten.",
  noScript: "Bitte aktivieren Sie JavaScript, um das Formular zu senden, oder",
  directEmail: "schreiben Sie Reza direkt per E-Mail",
  sending: "Ihre Anfrage wird gesendet…",
  submit: "Meine Immobiliensuche besprechen",
  consent: "Mit dem Absenden stimmen Sie zu, dass wir Sie zu Ihrer Anfrage kontaktieren. Lesen Sie unsere",
  privacy: "Datenschutzerklärung (auf Englisch)",
}

export default function BuyerEnquiryForm({ defaultRegion, defaultLocation, source, market = "uk" }: { defaultRegion?: string; defaultLocation?: string; source: string; market?: BuyerMarket }) {
  const copy = market === "germany" ? germanCopy : englishCopy
  const config = BUYER_MARKET_CONFIG[market]
  const intro = market === "germany"
    ? "Teilen Sie uns mit, welche Region Sie interessiert. Beginnen Sie per E-Mail und vereinbaren Sie bei Bedarf ein Videogespräch aus Deutschland."
    : `Tell us where you’re considering. You can start with an email and arrange a video conversation from ${market === "canada" ? "Canada" : "the UK"}.`
  const budgetHint = market === "canada"
    ? "Choose your purchase budget in US dollars (USD). If you’re planning in Canadian dollars (CAD), you can leave this open and discuss currency conversion."
    : market === "germany" ? "Bitte geben Sie Ihr Kaufbudget in US-Dollar an. Wenn Sie in Euro planen, können Sie das Budget zunächst offenlassen." : ""
  const id = useId()
  const [ready, setReady] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<UkBuyerField, string>>>({})
  const [deliveryError, setDeliveryError] = useState(false)
  const [localZone, setLocalZone] = useState("")
  const [targetLocation, setTargetLocation] = useState(defaultLocation || "")
  const formRef = useRef<HTMLFormElement>(null)
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const deliveryErrorRef = useRef<HTMLDivElement>(null)
  const startedAt = useRef(Date.now())
  const trackedStart = useRef(false)
  const submittingRef = useRef(false)

  useEffect(() => {
    setReady(true)
    setLocalZone(Intl.DateTimeFormat().resolvedOptions().timeZone || "")
  }, [])

  useEffect(() => {
    if (submitted) successRef.current?.focus()
  }, [submitted])

  useEffect(() => {
    if (deliveryError) deliveryErrorRef.current?.focus()
  }, [deliveryError])

  const analytics = { source, kind: "contact" as const, hasPropertyContext: false }
  const zones = buyerTimeZoneOptions(market, localZone)

  function fieldProps(field: UkBuyerField) {
    return {
      id: `${id}-${field}`,
      name: field,
      "aria-invalid": Boolean(fieldErrors[field]),
      "aria-describedby": [
        fieldErrors[field] ? `${id}-${field}-error` : "",
        field === "budgetRange" && budgetHint ? `${id}-budget-hint` : "",
        field === "timeZone" ? `${id}-time-zone-hint` : "",
        field === "requestedLanguage" ? `${id}-language-hint` : "",
      ].filter(Boolean).join(" ") || undefined,
      className: inputClass,
      style: inputStyle,
    }
  }

  function fieldError(field: UkBuyerField) {
    return fieldErrors[field] ? <p id={`${id}-${field}-error`} className="mt-2 text-sm text-[#a33127]">{fieldErrors[field]}</p> : null
  }

  function trackStart() {
    if (trackedStart.current) return
    trackedStart.current = true
    trackLeadEvent("lead_form_start", analytics)
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current) return
    setDeliveryError(false)
    const fields = new FormData(event.currentTarget)
    const values = Object.fromEntries(fields.entries())
    const parsed = buyerInquirySchemaForMarket(market).safeParse(values)
    if (!parsed.success) {
      const errors: Partial<Record<UkBuyerField, string>> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as UkBuyerField
        if (!errors[field]) errors[field] = issue.message
      }
      setFieldErrors(errors)
      trackLeadEvent("lead_error", { ...analytics, errorCode: "validation_failed" })
      const field = Object.keys(errors)[0]
      const input = formRef.current?.elements.namedItem(field)
      if (input instanceof HTMLElement) {
        if (detailsRef.current?.contains(input)) detailsRef.current.open = true
        requestAnimationFrame(() => input.focus())
      }
      return
    }

    setFieldErrors({})
    const payload = buildBuyerInquiryPayload(parsed.data, {
      source,
      pageUrl: window.location.href,
      company: String(fields.get("company") || ""),
      elapsedMs: Date.now() - startedAt.current,
    }, market)
    submittingRef.current = true
    setSubmitting(true)
    trackLeadEvent("lead_submit", analytics)
    try {
      const response = await fetch("/api/contact-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body: unknown = await response.json().catch(() => null)
      if (!confirmedUkBuyerDelivery(response.ok, body)) throw new Error("Delivery was not confirmed")
      trackLeadConversion(analytics)
      setSubmitted(true)
    } catch {
      trackLeadEvent("lead_error", { ...analytics, errorCode: "request_failed" })
      setDeliveryError(true)
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <section id="enquire" lang={market === "germany" ? "de" : market === "canada" ? "en-CA" : "en-GB"} aria-labelledby={`${id}-heading`} className="uk-funnel-form scroll-mt-24 rounded-2xl border border-[#d8dfdc] bg-white p-5 text-[#173b47] shadow-sm sm:p-8" style={{ backgroundColor: "#fff", color: "#173b47" }}>
      <h2 id={`${id}-heading`} className="text-2xl font-semibold leading-tight text-[#173b47] sm:text-3xl">{copy.heading}</h2>
      {submitted ? (
        <div ref={successRef} tabIndex={-1} role="status" className="mt-5 rounded-xl bg-[#f7f5f0] p-5 focus:outline-none focus:ring-2 focus:ring-[#173b47]">
          <h3 className="text-xl font-semibold text-[#173b47]">{copy.successHeading}</h3>
          <p className="mt-3 leading-relaxed text-[#53676d]">{copy.successBody}</p>
          <p className="mt-3 leading-relaxed text-[#53676d]">{copy.successNext}</p>
          <a href="/buyers-guide#buying-from-abroad" className="mt-4 inline-flex min-h-11 items-center font-medium text-[#173b47] underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[#173b47]">{copy.guide}</a>
        </div>
      ) : (
        <>
          <p className="mt-3 leading-relaxed text-[#53676d]">{intro}</p>
          <form ref={formRef} method="post" onSubmit={submit} onFocusCapture={trackStart} noValidate aria-busy={submitting} className="mt-6 space-y-5">
            <div className="sr-only" aria-hidden="true">
              <label htmlFor={`${id}-company`}>{copy.company}</label>
              <input id={`${id}-company`} name="company" tabIndex={-1} autoComplete="off" />
            </div>
            <fieldset disabled={submitting} className="space-y-5">
              <legend className="sr-only">{copy.legend}</legend>
              <div className="uk-contact-fields grid gap-5">
                <div>
                  <label htmlFor={`${id}-name`} className={labelClass}>{copy.name} <span className="font-normal">{copy.required}</span></label>
                  <input {...fieldProps("name")} required autoComplete="name" minLength={2} maxLength={160} />
                  {fieldError("name")}
                </div>
                <div>
                  <label htmlFor={`${id}-email`} className={labelClass}>{copy.email} <span className="font-normal">{copy.required}</span></label>
                  <input {...fieldProps("email")} required type="email" autoComplete="email" maxLength={254} />
                  {fieldError("email")}
                </div>
              </div>
              <div>
                <label htmlFor={`${id}-searchRegion`} className={labelClass}>{copy.region} <span className="font-normal">{copy.required}</span></label>
                <select {...fieldProps("searchRegion")} required defaultValue={resolveUkBuyerRegion(defaultRegion)} onChange={() => setTargetLocation("")}>
                  {UK_BUYER_REGIONS.map(region => <option key={region} value={region}>{buyerOptionLabel(region, market)}</option>)}
                </select>
                {fieldError("searchRegion")}
              </div>
              {defaultLocation && <div>
                <label htmlFor={`${id}-targetLocation`} className={labelClass}>{copy.targetLocation}</label>
                <input {...fieldProps("targetLocation")} value={targetLocation} onChange={event => setTargetLocation(event.target.value)} maxLength={160} />
                {fieldError("targetLocation")}
              </div>}
              <div>
                <label htmlFor={`${id}-purchaseTimeline`} className={labelClass}>{copy.timeline} <span className="font-normal">{copy.optional}</span></label>
                <select {...fieldProps("purchaseTimeline")} defaultValue="">
                  <option value="">{copy.chooseTimeline}</option>
                  {UK_BUYER_TIMELINES.map(timeline => <option key={timeline} value={timeline}>{buyerOptionLabel(timeline, market)}</option>)}
                </select>
                {fieldError("purchaseTimeline")}
              </div>

              <details ref={detailsRef} className="rounded-lg border border-[#d8dfdc] p-4">
                <summary className="min-h-11 cursor-pointer py-2 text-base font-medium text-[#173b47] focus:outline-none focus:ring-2 focus:ring-[#173b47]">{copy.details}</summary>
                <div className="mt-4 space-y-5">
                  <div>
                    <label htmlFor={`${id}-requestedLanguage`} className={labelClass}>{copy.language}</label>
                    <select {...fieldProps("requestedLanguage")} defaultValue={market === "germany" ? "German" : "English"}>
                      {BUYER_LANGUAGES.map(language => <option key={language} value={language}>{buyerOptionLabel(language, market)}</option>)}
                    </select>
                    {fieldError("requestedLanguage")}
                    <p id={`${id}-language-hint`} className="mt-2 text-sm text-[#53676d]">{copy.languageHint}</p>
                  </div>
                  <div>
                    <label htmlFor={`${id}-budgetRange`} className={labelClass}>{copy.budget}</label>
                    <select {...fieldProps("budgetRange")} defaultValue="">
                      <option value="">{copy.discussBudget}</option>
                      {UK_BUYER_BUDGETS.map(budget => <option key={budget} value={budget}>{buyerOptionLabel(budget, market)}</option>)}
                    </select>
                    {fieldError("budgetRange")}
                    {budgetHint && <p id={`${id}-budget-hint`} className="mt-2 text-sm text-[#53676d]">{budgetHint}</p>}
                  </div>
                  <div>
                    <label htmlFor={`${id}-phone`} className={labelClass}>{copy.phone}</label>
                    <input {...fieldProps("phone")} type="tel" autoComplete="tel" maxLength={60} placeholder={config.phonePlaceholder} />
                    {fieldError("phone")}
                  </div>
                  <div>
                    <label htmlFor={`${id}-contactPreference`} className={labelClass}>{copy.preference}</label>
                    <select {...fieldProps("contactPreference")} defaultValue="Email">
                      {UK_BUYER_CONTACT_PREFERENCES.map(preference => <option key={preference} value={preference}>{buyerOptionLabel(preference, market)}</option>)}
                    </select>
                    {fieldError("contactPreference")}
                  </div>
                  <div>
                    <label htmlFor={`${id}-timeZone`} className={labelClass}>{copy.timeZone}</label>
                    <select {...fieldProps("timeZone")} defaultValue={config.defaultTimeZone}>
                      {zones.map(zone => <option key={zone.value} value={zone.value}>{zone.label}</option>)}
                    </select>
                    {fieldError("timeZone")}
                    <p id={`${id}-time-zone-hint`} className="mt-2 text-sm text-[#53676d]">{copy.travel}</p>
                  </div>
                  <div>
                    <label htmlFor={`${id}-message`} className={labelClass}>{copy.message}</label>
                    <textarea {...fieldProps("message")} rows={4} maxLength={4000} placeholder={copy.messagePlaceholder} />
                    {fieldError("message")}
                  </div>
                </div>
              </details>
              {deliveryError && <div ref={deliveryErrorRef} tabIndex={-1} role="alert" className="rounded-lg border border-[#a33127] bg-[#fff6f2] p-4 text-sm text-[#8c2b23] focus:outline-none focus:ring-2 focus:ring-[#a33127]">{buyerDeliveryError(market)}{" "}<a href={CONTACT.email.href} className="inline-flex min-h-11 max-w-full items-center break-all underline">{CONTACT.email.display}</a></div>}
              <noscript><p>{copy.noScript} <a href={CONTACT.email.href}>{copy.directEmail}</a>.</p></noscript>
              <button type="submit" disabled={submitting || !ready} className="uk-funnel-button min-h-12 w-full rounded-lg bg-[#173b47] px-5 py-3 text-base font-semibold text-white hover:bg-[#244e5b] focus:outline-none focus:ring-2 focus:ring-[#173b47] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70" style={{ backgroundColor: "#173b47", color: "#fff" }}>
                {submitting ? copy.sending : copy.submit}
              </button>
            </fieldset>
            <p className="text-sm leading-relaxed text-[#53676d]">{copy.consent}{" "}<a href="/privacy" className="underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-[#173b47]">{copy.privacy}</a>.</p>
          </form>
        </>
      )}
    </section>
  )
}
