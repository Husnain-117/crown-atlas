"use client"

import { useState, useRef, useMemo } from "react"
import { Calendar, Clock, User, Mail, Phone, Send, CheckCircle, Home } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { getUnavailableDates, TIME_SLOTS, TOUR_TYPES } from "@/lib/tour-availability"
import { trackLeadConversion } from "@/lib/analytics/conversion"

interface ScheduleTourProps {
  listingKey: string
  address?: string
  city?: string
}

export default function ScheduleTour({ listingKey, address, city }: ScheduleTourProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [tourType, setTourType] = useState("in-person")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const startRef = useRef(Date.now())

  const unavailable = useMemo(() => new Set(getUnavailableDates()), [])

  const next14Days = useMemo(() => {
    const days: { date: string; label: string; dayName: string; disabled: boolean }[] = []
    const now = new Date()
    for (let i = 1; i <= 14; i++) {
      const d = new Date(now.getTime() + i * 86400000)
      const iso = d.toISOString().split("T")[0]
      days.push({
        date: iso,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
        disabled: unavailable.has(iso),
      })
    }
    return days
  }, [unavailable])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime) return
    setSubmitting(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const name = (fd.get("tourName") as string) || ""
    const email = (fd.get("tourEmail") as string) || ""
    const phone = (fd.get("tourPhone") as string) || ""

    const timeLabel = TIME_SLOTS.find((t) => t.value === selectedTime)?.label || selectedTime
    const dateLabel = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })

    const payload = {
      firstName: name.split(" ")[0] ?? "",
      lastName: name.split(" ").slice(1).join(" ") || "",
      fullName: name,
      email,
      phone,
      message: `Tour request for ${address || listingKey}${city ? `, ${city}` : ""}\nDate: ${dateLabel}\nTime: ${timeLabel}\nType: ${tourType}`,
      wantsTour: true,
      preferredTourDate: selectedDate,
      preferredTourTime: selectedTime,
      tourType,
      listingKey,
      propertyAddress: address || "",
      tags: ["tour-schedule", "pdp"],
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      __top: Date.now() - startRef.current,
      company: "",
    }

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const response = await res.json().catch(() => ({}))
      if (!res.ok || !response.success) throw new Error(response.error || "Submission failed")

      trackLeadConversion({ source: "property-schedule-tour", kind: "tour", hasPropertyContext: true })
      setSubmitted(true)
    } catch (err: any) {
      setError(err?.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-[1rem] bg-[var(--surface)] shadow-md border border-[var(--coastal-border)] p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--coastal-text)] mb-2">Tour Requested!</h3>
        <p className="text-sm text-[var(--coastal-muted-text)]">
          We&apos;ll confirm your tour for{" "}
          <span className="font-medium text-[var(--coastal-text)]">
            {new Date(selectedDate! + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </span>{" "}
          at{" "}
          <span className="font-medium text-[var(--coastal-text)]">
            {TIME_SLOTS.find((t) => t.value === selectedTime)?.label}
          </span>
          {" "}shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[1rem] bg-[var(--surface)] shadow-md border border-[var(--coastal-border)] overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-[var(--coastal-border)]">
        <h3 className="text-lg font-bold text-[var(--coastal-text)] flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[var(--coastal-primary)]" />
          Schedule a Tour
        </h3>
        {address && (
          <p className="text-sm text-[var(--coastal-muted-text)] mt-1 flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            {address}{city ? `, ${city}` : ""}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-5">
        {/* Date selector */}
        <div>
          <label className="text-sm font-medium text-[var(--coastal-text)] mb-2 block">
            Choose a date
          </label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {next14Days.map((d) => (
              <button
                key={d.date}
                type="button"
                disabled={d.disabled}
                onClick={() => setSelectedDate(d.date)}
                className={`flex flex-col items-center min-w-[56px] px-2 py-2 rounded-lg text-xs border transition-all ${
                  d.disabled
                    ? "opacity-30 cursor-not-allowed border-transparent"
                    : selectedDate === d.date
                    ? "bg-[var(--coastal-primary)] text-white border-[var(--coastal-primary)]"
                    : "border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] cursor-pointer"
                }`}
              >
                <span className="font-medium">{d.dayName}</span>
                <span className="text-[10px]">{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time slots */}
        <div>
          <label className="text-sm font-medium text-[var(--coastal-text)] mb-2 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Pick a time
          </label>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSelectedTime(t.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedTime === t.value
                    ? "bg-[var(--coastal-primary)] text-white border-[var(--coastal-primary)]"
                    : "border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] cursor-pointer"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tour type */}
        <div>
          <label className="text-sm font-medium text-[var(--coastal-text)] mb-2 block">Tour type</label>
          <div className="flex gap-2">
            {TOUR_TYPES.map((tt) => (
              <button
                key={tt.value}
                type="button"
                onClick={() => setTourType(tt.value)}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  tourType === tt.value
                    ? "bg-[var(--coastal-primary)] text-white border-[var(--coastal-primary)]"
                    : "border-[var(--coastal-border)] hover:border-[var(--coastal-primary)] cursor-pointer"
                }`}
              >
                {tt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contact fields */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="tourName" className="text-sm flex items-center gap-1.5 mb-1">
              <User className="h-3.5 w-3.5" /> Full Name
            </Label>
            <Input id="tourName" name="tourName" placeholder="Jane Doe" required />
          </div>
          <div>
            <Label htmlFor="tourEmail" className="text-sm flex items-center gap-1.5 mb-1">
              <Mail className="h-3.5 w-3.5" /> Email
            </Label>
            <Input id="tourEmail" name="tourEmail" type="email" placeholder="jane@example.com" required />
          </div>
          <div>
            <Label htmlFor="tourPhone" className="text-sm flex items-center gap-1.5 mb-1">
              <Phone className="h-3.5 w-3.5" /> Phone
            </Label>
            <Input id="tourPhone" name="tourPhone" type="tel" placeholder="(858) 555-1234" required />
          </div>
        </div>

        {error && <p className="text-sm text-[var(--error)]">{error}</p>}

        <Button
          type="submit"
          className="w-full"
          disabled={submitting || !selectedDate || !selectedTime}
        >
          {submitting ? "Sending..." : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Request Tour
            </>
          )}
        </Button>

        <p className="text-xs text-[var(--coastal-muted-text)] text-center">
          You&apos;ll receive an email confirmation. Tour times are subject to availability.
        </p>
      </form>
    </div>
  )
}
