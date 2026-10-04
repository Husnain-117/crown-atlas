"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, User, MessageSquare, Send, CheckCircle, AlertCircle, Home, BookOpen } from "lucide-react"
import { trackLeadConversion, trackLeadEvent } from "@/lib/analytics/conversion"

import { readContactContext, isInternationalPhone } from "@/lib/contact-context"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().max(60).optional().refine(isInternationalPhone, {
    message: "Please enter a valid phone number.",
  }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }).max(5000),
  searchRegion: z.string().max(200).optional(),
  purchaseTimeline: z.string().max(100).optional(),
  timeZone: z.string().max(100).optional(),
})

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const formStartedAtRef = useRef(Date.now())
  const formStartedTrackedRef = useRef(false)
  const honeypotRef = useRef<HTMLInputElement>(null)
  const searchParams = useSearchParams()
  const context = useMemo(() => readContactContext(searchParams || new URLSearchParams()), [searchParams])
  const { listingKey, propertyAddress, propertyPageUrl } = context
  const hasPropertyContext = Boolean(listingKey || propertyAddress)
  const leadSource = searchParams?.get("inquiry") === "financing"
    ? "property_financing_contact"
    : "contact_page"

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      searchRegion: "",
      purchaseTimeline: "",
      timeZone: "",
    },
  })

  function trackFormStart() {
    if (formStartedTrackedRef.current) return
    formStartedTrackedRef.current = true
    trackLeadEvent("lead_form_start", {
      source: leadSource,
      kind: "contact",
      hasPropertyContext,
      listingKey,
    })
  }

  useEffect(() => {
    if (!form.getFieldState("message").isDirty) {
      form.setValue("message", context.message)
    }
  }, [context.message, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setSubmitError(null)
    const eventOptions = {
      source: leadSource,
      kind: "contact" as const,
      hasPropertyContext,
      listingKey,
    }
    trackLeadEvent("lead_submit", eventOptions)

    try {
      const response = await fetch('/api/contact-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          source: leadSource,
          pageUrl: window.location.href,
          propertyAddress: propertyAddress || undefined,
          listingKey: listingKey || undefined,
          propertyPageUrl: propertyPageUrl || undefined,
          company: honeypotRef.current?.value || "",
          __top: Date.now() - formStartedAtRef.current,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success || !data.requestId) {
        throw new Error(data?.error || 'We could not confirm delivery. Please try again or contact us directly.')
      }

      trackLeadConversion(eventOptions)
      setIsSuccess(true)
      form.reset({ name: "", email: "", phone: "", message: context.message, searchRegion: "", purchaseTimeline: "", timeZone: "" })
      formStartedAtRef.current = Date.now()
      formStartedTrackedRef.current = false
      // Keep confirmation visible until the visitor chooses the next step.
    } catch (error) {
      console.error(error)
      trackLeadEvent("lead_error", { ...eventOptions, errorCode: "request_failed" })
      setSubmitError(
        error instanceof Error ? error.message : 'Something went wrong. Please try again or call us.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Inline success state: clear confirmation and next-step suggestions
  if (isSuccess) {
    return (
      <Card className="glass-card bg-[var(--surface)] border border-[var(--coastal-border)] shadow-medium rounded-2xl overflow-hidden theme-transition">
        <CardContent className="p-8 md:p-10">
          <div className="text-center animate-fade-in-up" role="status" aria-live="polite">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 mb-6">
              <CheckCircle className="h-10 w-10" aria-hidden />
            </div>
            <h3 className="text-2xl font-bold text-[var(--coastal-text)] mb-2 theme-transition">
              Thanks — we&apos;ll be in touch
            </h3>
            <p className="text-[var(--coastal-muted-text)] mb-8 max-w-md mx-auto theme-transition">
              Your message was delivered. We will review the details and follow up using the contact information you provided.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                type="button"
                variant="outline"
                className="border-[var(--coastal-border)] text-[var(--coastal-text)] hover:bg-[var(--surface-muted)]"
                onClick={() => setIsSuccess(false)}
              >
                Send another message
              </Button>
              <Button asChild className="bg-[var(--coastal-primary)] hover:bg-[var(--primary-hover)] text-white">
                <Link href="/properties" className="inline-flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Browse properties
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-[var(--coastal-border)] text-[var(--coastal-text)]">
                <Link href="/buyers-guide" className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Read the buyer’s guide
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card bg-[var(--surface)] border border-[var(--coastal-border)] shadow-medium rounded-2xl overflow-hidden theme-transition">
      <CardContent className="p-8">
        {submitError && (
          <div
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl flex items-start gap-3 animate-fade-in-up"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Couldn&apos;t send your message</p>
              <p className="text-sm mt-1">{submitError}</p>
            </div>
            <button
              type="button"
              onClick={() => setSubmitError(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:underline text-sm"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        )}
        {hasPropertyContext && (
          <div className="mb-6 rounded-xl border border-[var(--coastal-border)] bg-[var(--bg)] p-4">
            <p className="text-sm font-semibold text-[var(--coastal-text)]">Your selected property</p>
            <p className="mt-1 break-words text-sm text-[var(--coastal-muted-text)]">{context.subject}</p>
            {propertyPageUrl && <Link href={propertyPageUrl} className="mt-2 inline-block text-sm underline underline-offset-4">View property details</Link>}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} onFocusCapture={trackFormStart} className="space-y-6">
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="contact-company">Company</label>
              <input
                ref={honeypotRef}
                id="contact-company"
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--coastal-text)] font-semibold theme-transition">Full Name</FormLabel>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--coastal-muted-text)] group-focus-within:text-[var(--coastal-primary)] transition-colors" />
                    <FormControl>
                      <Input
                        className="pl-12 h-12 bg-[var(--bg)] border-[var(--coastal-border)] text-[var(--coastal-text)] rounded-xl focus:ring-2 focus:ring-[var(--coastal-primary)]/20 transition-all theme-transition"
                        placeholder="John Doe"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-red-500 dark:text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--coastal-text)] font-semibold theme-transition">Email Address</FormLabel>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--coastal-muted-text)] group-focus-within:text-[var(--coastal-primary)] transition-colors" />
                    <FormControl>
                      <Input
                        type="email"
                        className="pl-12 h-12 bg-[var(--bg)] border-[var(--coastal-border)] text-[var(--coastal-text)] rounded-xl focus:ring-2 focus:ring-[var(--coastal-primary)]/20 transition-all theme-transition"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-red-500 dark:text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--coastal-text)] font-semibold theme-transition">
                    Phone Number <span className="text-[var(--coastal-muted-text)] font-normal">(Optional)</span>
                  </FormLabel>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--coastal-muted-text)] group-focus-within:text-[var(--coastal-primary)] transition-colors" />
                    <FormControl>
                      <Input
                        className="pl-12 h-12 bg-[var(--bg)] border-[var(--coastal-border)] text-[var(--coastal-text)] rounded-xl focus:ring-2 focus:ring-[var(--coastal-primary)]/20 transition-all theme-transition"
                        type="tel"
                        autoComplete="tel"
                        placeholder="Include country code, e.g. +44"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-red-500 dark:text-red-400" />
                </FormItem>
              )}
            />

            <details className="rounded-xl border border-[var(--coastal-border)] p-4">
              <summary className="cursor-pointer font-medium text-[var(--coastal-text)]">Search and contact preferences (optional)</summary>
              <div className="mt-4 space-y-4">
                <label className="block text-sm text-[var(--coastal-text)]">
                  Area you are considering
                  <Input {...form.register("searchRegion")} maxLength={200} placeholder="e.g. San Diego or La Jolla" className="mt-2" />
                </label>
                <label className="block text-sm text-[var(--coastal-text)]">
                  When are you hoping to buy?
                  <Input {...form.register("purchaseTimeline")} maxLength={100} placeholder="e.g. In 3–6 months, or still exploring" className="mt-2" />
                </label>
                <label className="block text-sm text-[var(--coastal-text)]">
                  Where should we schedule your call?
                  <Input {...form.register("timeZone")} maxLength={100} placeholder="e.g. London, UK" className="mt-2" />
                </label>
                <p className="text-xs text-[var(--coastal-muted-text)]">Tell us your preferred contact times in your message. We will confirm a time and time zone together.</p>
              </div>
            </details>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[var(--coastal-text)] font-semibold theme-transition">Your Message</FormLabel>
                  <div className="relative group">
                    <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-[var(--coastal-muted-text)] group-focus-within:text-[var(--coastal-primary)] transition-colors" />
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your real estate needs..."
                        className="min-h-[150px] pl-12 pt-4 bg-[var(--bg)] border-[var(--coastal-border)] text-[var(--coastal-text)] rounded-xl focus:ring-2 focus:ring-[var(--coastal-primary)]/20 resize-none transition-all theme-transition"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-red-500 dark:text-red-400" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-[var(--coastal-primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl h-12 font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send Message
                </>
              )}
            </Button>
            <p className="text-xs text-center text-[var(--coastal-muted-text)]">
              By submitting, you agree to be contacted about your inquiry. Read our{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-[var(--coastal-primary)]">
                privacy policy
              </Link>.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
