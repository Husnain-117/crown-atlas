"use client";

import type React from "react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { trackLeadConversion, trackLeadEvent } from "@/lib/analytics/conversion";
import { AgentContactCard } from "./AgentContactCard";

interface ContactFormProps {
  propertyId: string;
  proertyData: any; // typo kept for compatibility with current props
  city?: string;
  state?: string;
  county?: string;
  allowTourRequest?: boolean;
}

export default function ContactForm({
  propertyId,
  proertyData,
  city,
  state,
  county,
  allowTourRequest = true,
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startRef = useRef<number>(Date.now()); // anti-bot timer
  const formStartedTrackedRef = useRef(false);

  const defaults = {
    city: city ?? proertyData?.city ?? "",
    state: state ?? proertyData?.state ?? "CA",
    county: county ?? proertyData?.county ?? "",
  };

  const propertyAddress = useMemo(() => {
    const street = String(proertyData?.address || "").trim();
    const locality = [
      String(proertyData?.city || defaults.city || "").trim(),
      [String(proertyData?.state || defaults.state || "CA").trim(), String(proertyData?.postal_code || proertyData?.zip_code || "").trim()]
        .filter(Boolean)
        .join(" "),
    ].filter(Boolean).join(", ");

    return [street, locality].filter(Boolean).join(", ");
  }, [defaults.city, defaults.state, proertyData]);

  const defaultMessage = `I'm interested in ${propertyAddress || "this property"} (Listing ID: ${propertyId}). Please contact me with more information.`;

  function trackFormStart() {
    if (formStartedTrackedRef.current) return;
    formStartedTrackedRef.current = true;
    trackLeadEvent("lead_form_start", {
      source: "property-detail-contact",
      kind: "contact",
      hasPropertyContext: true,
      listingKey: propertyId,
    });
  }

  // helpful tags for CRM routing
  const tags = useMemo(() => {
    const t: string[] = ["pdp"]; // product detail page
    if (proertyData?.property_type) {
      t.push(String(proertyData.property_type).toLowerCase());
    }
    t.push(`prop:${propertyId}`);
    return t;
  }, [proertyData, propertyId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const fd = new FormData(e.currentTarget);

    // anti-spam: required hidden honeypot + time on page
    const msOnPage = Date.now() - startRef.current;
    fd.set("__top", String(msOnPage));
    if (!fd.has("company")) fd.set("company", ""); // honeypot must exist & be empty

    const name = (fd.get("name") as string) || "";
    const email = (fd.get("email") as string) || "";
    const phone = (fd.get("phone") as string) || "";
    const message =
      (fd.get("message") as string) ||
      defaultMessage;
    const wantsTour = allowTourRequest && fd.get("wantsTour") === "on";
    const eventOptions = {
      source: "property-detail-contact",
      kind: wantsTour ? "tour" as const : "contact" as const,
      hasPropertyContext: true,
      listingKey: propertyId,
    };

    trackLeadEvent("lead_submit", eventOptions);

    const payload: any = {
      // LeadPayload names used by /api/leads
      firstName: name.split(" ")[0] ?? "",
      lastName: name.split(" ").slice(1).join(" ") || "",
      fullName: name || undefined,
      email,
      phone,
      message,
      city: (fd.get("city") as string) || defaults.city,
      state: (fd.get("state") as string) || defaults.state,
      county: (fd.get("county") as string) || defaults.county,
      budgetMax: fd.get("budgetMax") ? Number(fd.get("budgetMax")) : undefined,
      timeframe: (fd.get("timeframe") as string) || "30d",
      wantsTour,
      listingKey: propertyId,
      propertyId,
      propertyAddress,
      source: "property_detail_contact",
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      tags,
      // anti-spam passthroughs read by the API
      __top: msOnPage,
      company: fd.get("company"),
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json?.error || "Failed to submit form");
      trackLeadConversion(eventOptions);
      setIsSubmitted(true);
    } catch (err: any) {
      trackLeadEvent("lead_error", { ...eventOptions, errorCode: "request_failed" });
      setError(err?.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-4">
        <h3 className="font-semibold text-green-600 mb-2">Thank you!</h3>
        <p className="text-sm text-muted-foreground">
          Your message has been sent. The agent will contact you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} onChangeCapture={trackFormStart} className="space-y-4">
      {/* honeypot for bots (must remain empty) */}
      <input name="company" className="hidden" tabIndex={-1} autoComplete="off" />
      <input name="city" value={defaults.city} readOnly hidden />
      <input name="state" value={defaults.state} readOnly hidden />
      <input name="county" value={defaults.county} readOnly hidden />

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="name" className="mb-2 block">Your Name</Label>
          <Input id="name" name="name" placeholder="John Doe" autoComplete="name" required />
        </div>
        <div>
          <Label htmlFor="email" className="mb-2 block">Email</Label>
          <Input id="email" name="email" type="email" placeholder="john@example.com" autoComplete="email" required />
        </div>
        <div>
          <Label htmlFor="phone" className="mb-2 block">Phone</Label>
          <Input id="phone" name="phone" type="tel" placeholder="(123) 456-7890" autoComplete="tel" />
        </div>

        <div>
          <Label htmlFor="message" className="mb-2 block">Message</Label>
          <Textarea
            id="message"
            name="message"
            className="resize-none"
            rows={4}
            autoComplete="off"
            defaultValue={defaultMessage}
            required
          />
        </div>

        {allowTourRequest && (
          <div className="flex items-start gap-2">
            <Checkbox id="wantsTour" name="wantsTour" />
            <Label htmlFor="wantsTour" className="text-sm font-normal leading-5">
              I want to schedule a tour
            </Label>
          </div>
        )}

        <div className="flex items-start gap-2">
          <Checkbox id="consent" required />
          <Label htmlFor="consent" className="text-sm font-normal leading-5">
            I consent to being contacted about real estate opportunities.
          </Label>
        </div>
      </div>

      {error && <div className="text-sm text-red-700 dark:text-red-400" role="alert">{error}</div>}

      <Button
        type="submit"
        className="min-h-12 w-full cursor-pointer bg-[var(--coastal-action)] text-sm text-white hover:bg-[var(--coastal-action-hover)] sm:text-base"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send inquiry"}
      </Button>

      <p className="text-center text-xs leading-5 text-[var(--coastal-muted-text)]">
        No obligation. Your inquiry goes directly to the Crown Coastal team.
      </p>

      <AgentContactCard
        className="mt-8 !p-0 !border-0 !shadow-none bg-transparent dark:bg-transparent"
        propertyAddress={propertyAddress}
        listingKey={propertyId}
      />
    </form>
  );
}
