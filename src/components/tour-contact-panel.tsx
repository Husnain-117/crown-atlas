"use client"

import { useEffect, useState, useRef } from "react"
import { Calendar, MapPin, User, Mail, Phone, Send, CheckCircle } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import TourPreferences from "@/components/forms/tour-preferences"
import { trackLeadConversion, trackLeadEvent } from "@/lib/analytics/conversion"
import { CONTACT } from "@/lib/constants/contact"

export interface PropertyContext {
  listingKey: string
  address?: string
  city?: string
  state?: string
  county?: string
}

interface TourContactPanelProps {
  open: boolean
  onClose: () => void
  mode: "book-visit" | "talk-to-agent"
  propertyContext?: PropertyContext
}

export default function TourContactPanel({
  open,
  onClose,
  mode,
  propertyContext,
}: TourContactPanelProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const startRef = useRef(Date.now())

  const title = mode === "book-visit" ? "Book a Visit" : "Talk to Agent"
  const subtitle = mode === "book-visit"
    ? "Schedule a property tour — we'll confirm a time that works for you."
    : "Ask a question or get more details about this property."

  useEffect(() => {
    if (open) startRef.current = Date.now()
  }, [open])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const name = (fd.get("name") as string) || ""
    const email = (fd.get("email") as string) || ""
    const phone = (fd.get("phone") as string) || ""
    const preferredDate = (fd.get("preferredDate") as string) || ""
    const message = (fd.get("message") as string) || ""
    const company = (fd.get("company") as string) || ""

    const payload = {
      name,
      email,
      phone,
      message,
      mode: mode === "book-visit" ? "tour" : "agent",
      preferredDate,
      preferredTime: String(fd.get("preferredTime") || ""),
      tourType: String(fd.get("tourType") || "in-person"),
      timeZone: String(fd.get("timeZone") || "America/Los_Angeles"),
      propertyData: {
        listing_key: propertyContext?.listingKey,
        address: [propertyContext?.address, propertyContext?.city, propertyContext?.state]
          .filter(Boolean)
          .join(", "),
      },
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      __top: Date.now() - startRef.current,
      company,
    }

    const eventOptions = { source: "tour-contact-panel", kind: mode === "book-visit" ? "tour" as const : "contact" as const, hasPropertyContext: Boolean(propertyContext?.listingKey), listingKey: propertyContext?.listingKey };
    trackLeadEvent("lead_submit", eventOptions)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const response = await res.json().catch(() => ({}))
      if (!res.ok || !response.success || !response.requestId) {
        throw new Error(response.error || "Submission failed")
      }

      trackLeadConversion(eventOptions)
      setSubmitted(true)
    } catch (submitError) {
      trackLeadEvent("lead_error", { ...eventOptions, errorCode: "request_failed" })
      setError(
        submitError instanceof Error
          ? submitError.message
          : `Please try again or call ${CONTACT.phone.display}.`,
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose()
      setTimeout(() => {
        setSubmitted(false)
        setError(null)
      }, 300)
    }
  }


  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {mode === "book-visit" ? (
              <Calendar className="h-5 w-5 text-[var(--coastal-primary)]" />
            ) : (
              <Phone className="h-5 w-5 text-[var(--coastal-primary)]" />
            )}
            {title}
          </SheetTitle>
          <SheetDescription>{subtitle}</SheetDescription>
        </SheetHeader>

        {propertyContext?.address && (
          <div className="mx-4 px-3 py-2 rounded-lg bg-[var(--surface-muted)] border border-[var(--coastal-border)] flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-[var(--coastal-primary)] shrink-0" />
            <span className="text-[var(--coastal-text)] font-medium truncate">
              {propertyContext.address}
              {propertyContext.city ? `, ${propertyContext.city}` : ""}
            </span>
          </div>
        )}

        {submitted ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--coastal-text)] mb-2">Request Received!</h3>
            <p className="text-sm text-[var(--coastal-muted-text)]">
              {mode === "book-visit"
                ? "Reza will review your request and confirm the tour format, date and time zone with you."
                : "Your message was delivered. Reza will follow up using the details you provided."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-4">
            <div className="sr-only" aria-hidden="true">
              <Label htmlFor="tour-company">Company</Label>
              <Input id="tour-company" name="company" tabIndex={-1} autoComplete="off" />
            </div>
            <div>
              <Label htmlFor="panel-name" className="text-sm flex items-center gap-1.5 mb-1.5">
                <User className="h-3.5 w-3.5" /> Full Name
              </Label>
              <Input id="panel-name" name="name" placeholder="Jane Doe" required />
            </div>

            <div>
              <Label htmlFor="panel-email" className="text-sm flex items-center gap-1.5 mb-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </Label>
              <Input id="panel-email" name="email" type="email" placeholder="jane@example.com" required />
            </div>

            <div>
              <Label htmlFor="panel-phone" className="text-sm flex items-center gap-1.5 mb-1.5">
                <Phone className="h-3.5 w-3.5" /> Phone (optional)
              </Label>
              <Input id="panel-phone" name="phone" type="tel" autoComplete="tel" maxLength={60} placeholder="Include country code, e.g. +44" />
            </div>

            {mode === "book-visit" && <TourPreferences idPrefix="tour-sheet" />}

            <div>
              <Label htmlFor="panel-message" className="text-sm mb-1.5 block">
                Message (optional)
              </Label>
              <Textarea
                id="panel-message"
                name="message"
                placeholder={
                  mode === "book-visit"
                    ? "Any preferences for the tour?"
                    : "What would you like to know?"
                }
                rows={3}
              />
            </div>

            {error && (
              <p className="text-sm text-[var(--error)]" role="alert">
                {error} Call {CONTACT.phone.display} if the request is time-sensitive.
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Sending..." : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {mode === "book-visit" ? "Request Tour" : "Send Message"}
                </>
              )}
            </Button>
            <p className="text-xs text-center text-[var(--coastal-muted-text)]">
              By submitting, you agree to be contacted about this request. Read our{" "}
              <a href="/privacy" className="underline underline-offset-2 hover:text-[var(--coastal-primary)]">
                privacy policy
              </a>.
            </p>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}
