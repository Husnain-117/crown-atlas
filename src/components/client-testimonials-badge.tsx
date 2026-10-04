"use client"

import Link from "next/link"
import { ExternalLink, MessageSquareQuote, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { CLIENT_TESTIMONIALS } from "@/lib/client-testimonials"

export function ClientTestimonialsBadge({ showModal = false }: { showModal?: boolean }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const trigger = triggerRef.current
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", closeOnEscape)
    closeRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", closeOnEscape)
      trigger?.focus()
    }
  }, [open])

  const content = (
    <>
      <MessageSquareQuote aria-hidden="true" className="h-4 w-4 text-[#9A7728]" />
      <span className="font-semibold text-gray-800">Client testimonials</span>
    </>
  )

  if (!showModal) {
    return (
      <Link
        href="/testimonials"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/20 bg-white px-3 py-1.5 text-sm shadow-lg transition-shadow hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coastal-secondary)] focus-visible:ring-offset-2"
      >
        {content}
      </Link>
    )
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="client-testimonials-dialog"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/20 bg-white px-3 py-1.5 text-sm shadow-lg transition-shadow hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coastal-secondary)] focus-visible:ring-offset-2"
      >
        {content}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[10000] bg-black/45"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false)
          }}
        >
          <div
            id="client-testimonials-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="client-testimonials-title"
            className="absolute right-0 top-0 h-full w-full overflow-y-auto bg-white p-5 text-slate-900 shadow-2xl md:w-[460px]"
          >
            <div className="mb-4 flex min-h-11 items-center justify-between gap-4">
              <h2 id="client-testimonials-title" className="text-lg font-semibold">
                Client testimonials
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-11 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700"
                aria-label="Close client testimonials"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {CLIENT_TESTIMONIALS.map((testimonial) => (
                <article key={testimonial.name} className="rounded-md border border-slate-200 p-3">
                  <h3 className="text-sm font-medium">{testimonial.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    &ldquo;{excerpt(testimonial.text)}&rdquo;
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-200 pt-5">
              <Link
                href="/testimonials"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-11 items-center rounded-md bg-slate-900 px-4 text-sm font-semibold text-white"
              >
                Read full testimonials
              </Link>
              <a
                href="https://www.zillow.com/profile/RezaSoCal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold"
              >
                External profile <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function excerpt(value: string, limit = 360): string {
  if (value.length <= limit) return value
  const shortened = value.slice(0, limit)
  const lastSpace = shortened.lastIndexOf(" ")
  return `${shortened.slice(0, lastSpace > 0 ? lastSpace : limit)}...`
}
