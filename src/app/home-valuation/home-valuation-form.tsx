"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { MapPin, User, Phone, Mail, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type Step = "address" | "cma-form" | "submitted"

export default function HomeValuationForm() {
  const [step, setStep] = useState<Step>("address")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [cmaSubmitting, setCmaSubmitting] = useState(false)
  const [cmaError, setCmaError] = useState<string | null>(null)
  const startRef = useRef<number>(Date.now())
  const autocompleteInitRef = useRef(false)
  const addressInputId = "home-valuation-address-input"

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = address.trim()
    if (!clean) return

    setLoading(true)
    setAddress(clean)
    setStep("cma-form")
    setLoading(false)
  }

  // Google Places Autocomplete (address input only)
  useEffect(() => {
    if (step !== "address") return
    if (autocompleteInitRef.current) return
    if (typeof window === "undefined") return

    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    const inputEl = document.getElementById(addressInputId) as HTMLInputElement | null
    if (!key || !inputEl) return

    const initAutocomplete = () => {
      const googleAny = (window as any).google
      if (!googleAny?.maps?.places) return

      try {
        autocompleteInitRef.current = true
        const ac = new googleAny.maps.places.Autocomplete(inputEl, {
          types: ["address"],
          fields: ["formatted_address"],
          componentRestrictions: { country: ["us"] },
        })

        ac.addListener("place_changed", () => {
          const place = ac.getPlace()
          const formatted = place?.formatted_address
          if (formatted) setAddress(formatted)
        })
      } catch {
        // If Places init fails, user can still type address manually.
      }
    }

    // If script already present, init immediately.
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-google-places="1"]'
    )
    if (existing) {
      initAutocomplete()
      return
    }

    const cbName = `__cc_places_cb_${Math.random().toString(16).slice(2)}`
    ;(window as any)[cbName] = () => initAutocomplete()

    const script = document.createElement("script")
    script.setAttribute("data-google-places", "1")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=${cbName}`
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    return () => {
      try {
        delete (window as any)[cbName]
      } catch {}
    }
  }, [step])

  const handleCmaSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCmaSubmitting(true)
    setCmaError(null)

    const fd = new FormData(e.currentTarget)
    const name = (fd.get("cmaName") as string) || ""

    const payload = {
      firstName: name.split(" ")[0] ?? "",
      lastName: name.split(" ").slice(1).join(" ") || "",
      fullName: name,
      email: fd.get("cmaEmail") as string,
      phone: fd.get("cmaPhone") as string,
      message: `CMA request for: ${address}`,
      tags: ["cma-request", "home-valuation"],
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
      setStep("submitted")
    } catch (err: any) {
      setCmaError(err?.message || "Something went wrong")
    } finally {
      setCmaSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step 1: Address input */}
      {step === "address" && (
        <form onSubmit={handleAddressSubmit} className="bg-[var(--surface)] rounded-lg border border-[var(--coastal-border)] p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--coastal-primary)]/10 mb-4">
              <MapPin className="h-7 w-7 text-[var(--coastal-primary)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--coastal-text)]">Enter your property address</h2>
            <p className="text-sm text-[var(--coastal-muted-text)] mt-1">Request a comparative market analysis based on available property and market data.</p>
          </div>
          <Label htmlFor={addressInputId} className="sr-only">Property address</Label>
          <Input
            placeholder="123 Main St, San Diego, CA 92101"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="h-12 text-base mb-4"
            required
            id={addressInputId}
          />
          <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
            {loading ? "Continuing..." : "Request a Home Value Review"}
          </Button>
        </form>
      )}

      {/* Contact details for the valuation request */}
      {step === "cma-form" && (
        <form onSubmit={handleCmaSubmit} className="bg-[var(--surface)] rounded-lg border border-[var(--coastal-border)] p-6 sm:p-8 shadow-sm space-y-5">
          <div className="text-center mb-2">
            <h2 className="text-xl font-semibold text-[var(--coastal-text)]">Request a Comparative Market Analysis</h2>
            <p className="text-sm text-[var(--coastal-muted-text)] mt-1">
              For: <span className="font-medium text-[var(--coastal-text)]">{address}</span>
            </p>
            <p className="text-xs text-[var(--coastal-muted-text)] mt-2">
              The review can include relevant comparable sales, active competition, and property-specific pricing considerations.
            </p>
          </div>

          <div>
            <Label htmlFor="cmaName" className="text-sm flex items-center gap-1.5 mb-1.5">
              <User className="h-3.5 w-3.5" /> Full Name
            </Label>
            <Input id="cmaName" name="cmaName" placeholder="Jane Doe" required />
          </div>

          <div>
            <Label htmlFor="cmaPhone" className="text-sm flex items-center gap-1.5 mb-1.5">
              <Phone className="h-3.5 w-3.5" /> Phone <span className="font-normal text-[var(--coastal-muted-text)]">(optional)</span>
            </Label>
            <Input id="cmaPhone" name="cmaPhone" type="tel" autoComplete="tel" placeholder="(858) 555-1234" />
          </div>

          <div>
            <Label htmlFor="cmaEmail" className="text-sm flex items-center gap-1.5 mb-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </Label>
            <Input id="cmaEmail" name="cmaEmail" type="email" autoComplete="email" placeholder="jane@example.com" required />
          </div>

          {cmaError && <p className="text-sm text-[var(--error)]">{cmaError}</p>}

          <div className="flex gap-3">
            <Button type="submit" className="flex-1 h-11" disabled={cmaSubmitting}>
              {cmaSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
            <Button type="button" variant="outline" className="h-11" onClick={() => setStep("address")}>
              Back
            </Button>
          </div>
          <p className="text-xs leading-relaxed text-[var(--coastal-muted-text)]">
            By submitting, you agree to be contacted about this request. See our{" "}
            <Link href="/privacy" className="underline hover:text-[var(--coastal-primary)]">privacy policy</Link>.
          </p>
        </form>
      )}

      {/* Success */}
      {step === "submitted" && (
        <div className="bg-[var(--surface)] rounded-lg border border-[var(--coastal-border)] p-8 shadow-sm text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <Check className="h-7 w-7 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--coastal-text)] mb-2">Request Received!</h2>
          <p className="text-sm text-[var(--coastal-muted-text)] mb-1">Thank you for requesting a CMA for:</p>
          <p className="font-medium text-[var(--coastal-text)] mb-4">{address}</p>
          <p className="text-sm text-[var(--coastal-muted-text)]">
            The team will review the property information and follow up using the contact details you provided.
          </p>
        </div>
      )}
    </div>
  )
}
