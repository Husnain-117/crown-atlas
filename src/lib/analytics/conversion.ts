"use client"

import { classifySeoPage } from "@/lib/analytics/page-classification"

export type LeadKind = "lead" | "tour" | "valuation" | "contact"
export type LeadEventName =
  | "lead_cta_click"
  | "lead_form_start"
  | "lead_form_step"
  | "lead_submit"
  | "lead_success"
  | "lead_error"

export type LeadEventOptions = {
  source: string
  kind?: LeadKind
  hasPropertyContext?: boolean
  listingKey?: string
  formStep?: "contact"
  errorCode?: "request_failed" | "validation_failed"
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown> | IArguments>
    gtag?: (...args: unknown[]) => void
  }
}

export function buildLeadAnalyticsParameters(
  pathname: string,
  {
    source,
    kind = "lead",
    hasPropertyContext = false,
    listingKey,
    formStep,
    errorCode,
  }: LeadEventOptions,
): Record<string, string | boolean> {
  return {
    page_type: classifySeoPage(pathname),
    lead_source: source,
    lead_kind: kind,
    property_context: hasPropertyContext,
    ...(listingKey ? { listing_id: listingKey } : {}),
    ...(formStep ? { form_step: formStep } : {}),
    ...(errorCode ? { error_code: errorCode } : {}),
  }
}

export function trackLeadEvent(
  event: LeadEventName,
  options: LeadEventOptions,
): void {
  if (typeof window === "undefined") return
  sendAnalyticsEvent(
    event,
    buildLeadAnalyticsParameters(window.location.pathname, options),
  )
}

export function trackLeadConversion({
  source,
  kind = "lead",
  hasPropertyContext = false,
  listingKey,
}: {
  source: string
  kind?: LeadKind
  hasPropertyContext?: boolean
  listingKey?: string
}): void {
  if (typeof window === "undefined") return
  const parameters = buildLeadAnalyticsParameters(window.location.pathname, {
    source,
    kind,
    hasPropertyContext,
    listingKey,
  })

  sendAnalyticsEvent("lead_success", parameters)
  sendAnalyticsEvent("generate_lead", parameters)
}

function sendAnalyticsEvent(
  event: LeadEventName | "generate_lead",
  parameters: Record<string, string | boolean>,
): void {
  if (window.gtag) {
    window.gtag("event", event, parameters)
  } else {
    window.dataLayer = window.dataLayer || []
    window.gtag = function () {
      window.dataLayer!.push(arguments)
    }
    window.gtag("event", event, parameters)
  }
}
