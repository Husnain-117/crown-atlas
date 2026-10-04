"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { useContactPanel } from "@/stores/use-contact-panel";
import TourPreferences from "@/components/forms/tour-preferences";
import { CONTACT } from "@/lib/constants/contact";
import { trackLeadConversion, trackLeadEvent } from "@/lib/analytics/conversion";

export default function ContactSlidePanel() {
  const panel = useContactPanel();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const startedAtRef = useRef(Date.now());
  const formStartedTrackedRef = useRef(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const successRef = useRef<HTMLParagraphElement>(null);
  const { isOpen, close } = panel;

  const title = useMemo(() => (panel.mode === "tour" ? "Request a Tour" : "Talk to Agent"), [panel.mode]);

  useEffect(() => {
    if (!isOpen) return;

    setMessage(null);
    setError(null);
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    startedAtRef.current = Date.now();
    formStartedTrackedRef.current = false;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => firstInputRef.current?.focus(), 50);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not([hidden]):not([tabindex="-1"]), textarea, select, a[href]') || []);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!dialogRef.current?.contains(document.activeElement)) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); }
        else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (message && isOpen) successRef.current?.focus();
  }, [message, isOpen]);

  function trackFormStart() {
    if (formStartedTrackedRef.current) return;
    formStartedTrackedRef.current = true;
    trackLeadEvent("lead_form_start", {
      source: "property-contact-panel",
      kind: panel.mode === "tour" ? "tour" : "contact",
      hasPropertyContext: Boolean(panel.propertyKey || panel.propertyAddress),
      listingKey: panel.propertyKey,
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSending(true);

    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const preferredDate = String(fd.get("preferredDate") || "").trim();
    const note = String(fd.get("message") || "").trim();
    const company = String(fd.get("company") || "").trim();
    const eventOptions = {
      source: "property-contact-panel",
      kind: panel.mode === "tour" ? "tour" as const : "contact" as const,
      hasPropertyContext: Boolean(panel.propertyKey || panel.propertyAddress),
      listingKey: panel.propertyKey,
    };

    trackLeadEvent("lead_submit", eventOptions);

    if (!name || !email) {
      trackLeadEvent("lead_error", { ...eventOptions, errorCode: "validation_failed" });
      setError("Name and email are required.");
      setSending(false);
      return;
    }
    if (panel.mode === "tour" && !preferredDate) {
      trackLeadEvent("lead_error", { ...eventOptions, errorCode: "validation_failed" });
      setError("Preferred tour date is required for tour requests.");
      setSending(false);
      return;
    }

    const payload = {
      name,
      email,
      phone,
      message: note,
      propertyData: {
        listing_key: panel.propertyKey,
        address: panel.propertyAddress,
      },
      mode: panel.mode,
      preferredDate,
      preferredTime: String(fd.get("preferredTime") || ""),
      tourType: String(fd.get("tourType") || "in-person"),
      timeZone: String(fd.get("timeZone") || "America/Los_Angeles"),
      pageUrl: window.location.href,
      company,
      __top: Date.now() - startedAtRef.current,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const response = await res.json().catch(() => ({}));
      if (!res.ok || !response.success || !response.requestId) {
        throw new Error(response.error || "Request failed");
      }

      trackLeadConversion(eventOptions);
      setMessage("Request delivered. Reza will follow up using the contact details you provided.");

    } catch (submitError) {
      trackLeadEvent("lead_error", { ...eventOptions, errorCode: "request_failed" });
      setError(
        submitError instanceof Error
          ? `${submitError.message} Call ${CONTACT.phone.display} if the request is time-sensitive.`
          : `Please try again or call ${CONTACT.phone.display}.`,
      );
    } finally {
      setSending(false);
    }
  }

  if (!panel.isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto">
      <button
        type="button"
        aria-label="Close contact panel"
        onClick={panel.close}
        className="absolute inset-0 bg-black/45 opacity-100 transition-opacity"
      />

      <aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-panel-title"
        className="absolute bottom-0 right-0 max-h-[90vh] w-full overflow-y-auto rounded-t-lg bg-[var(--surface)] shadow-[0_0_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out md:bottom-auto md:top-0 md:h-full md:max-h-full md:w-[440px] md:rounded-l-lg md:rounded-tr-none theme-transition"
      >
        <div className="p-5 border-b border-[var(--coastal-border)] flex items-start justify-between gap-4">
          <div>
            <h2 id="contact-panel-title" className="text-xl font-semibold text-[var(--coastal-text)]">{title}</h2>
            <p className="text-sm text-[var(--coastal-muted-text)] mt-1">{panel.propertyAddress || "Property inquiry"}</p>
          </div>
          <button
            type="button"
            onClick={panel.close}
            className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-md text-[var(--coastal-muted-text)] hover:bg-[var(--surface-muted)] hover:text-[var(--coastal-text)]"
            aria-label="Close contact panel"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {message ? (
          <div className="space-y-4 p-5">
            <p ref={successRef} tabIndex={-1} className="text-[var(--coastal-text)] outline-none" role="status">{message}</p>
            <button type="button" onClick={panel.close} className="min-h-11 rounded-lg border border-[var(--coastal-border)] px-5">Done</button>
          </div>
        ) : <form onSubmit={onSubmit} onChangeCapture={trackFormStart} className="p-5 space-y-4">
          <input name="propertyKey" value={panel.propertyKey} readOnly hidden />
          <input name="propertyAddress" value={panel.propertyAddress} readOnly hidden />
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="panel-company">Company</label>
            <input id="panel-company" name="company" tabIndex={-1} autoComplete="off" />
          </div>

          <label className="block">
            <span className="text-sm font-medium text-[var(--coastal-text)]">Full name</span>
            <input ref={firstInputRef} name="name" autoComplete="name" required className="mt-1 h-11 w-full rounded border border-[var(--coastal-border)] bg-[var(--surface-muted)] text-[var(--coastal-text)] px-3 focus:ring-2 focus:ring-[var(--coastal-primary)] outline-none transition-all" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[var(--coastal-text)]">Email</span>
            <input name="email" type="email" autoComplete="email" required className="mt-1 h-11 w-full rounded border border-[var(--coastal-border)] bg-[var(--surface-muted)] text-[var(--coastal-text)] px-3 focus:ring-2 focus:ring-[var(--coastal-primary)] outline-none transition-all" />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[var(--coastal-text)]">Phone (optional)</span>
            <input name="phone" type="tel" autoComplete="tel" maxLength={60} placeholder="Include country code, e.g. +44" className="mt-1 h-11 w-full rounded border border-[var(--coastal-border)] bg-[var(--surface-muted)] text-[var(--coastal-text)] px-3 focus:ring-2 focus:ring-[var(--coastal-primary)] outline-none transition-all" />
          </label>

          {panel.mode === "tour" && <TourPreferences idPrefix="contact-panel" />}

          <label className="block">
            <span className="text-sm font-medium text-[var(--coastal-text)]">Message</span>
            <textarea name="message" rows={4} className="mt-1 w-full rounded border border-[var(--coastal-border)] bg-[var(--surface-muted)] text-[var(--coastal-text)] px-3 py-2 focus:ring-2 focus:ring-[var(--coastal-primary)] outline-none transition-all" />
          </label>

          {error && <p className="text-sm text-[var(--error)]" role="alert">{error}</p>}
          {message && <p className="text-sm text-[var(--success)]" role="status">{message}</p>}

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-lg bg-[var(--coastal-primary)] py-3 font-bold text-white shadow-md transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send request"}
          </button>
          <p className="text-xs text-center text-[var(--coastal-muted-text)]">
            By submitting, you agree to be contacted about this inquiry. Read our{" "}
            <a href="/privacy" className="underline underline-offset-2 hover:text-[var(--coastal-primary)]">
              privacy policy
            </a>.
          </p>
        </form>}
      </aside>
    </div>
  );
}
