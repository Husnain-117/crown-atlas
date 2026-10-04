"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LeadCaptureFormProps {
  className?: string;
  propertyId?: string;
  city?: string;
}

export function LeadCaptureForm({ className = "", propertyId, city }: LeadCaptureFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedAtRef = useRef(Date.now());
  const honeypotRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          propertyId,
          city,
          source: "lead_capture_form",
          company: honeypotRef.current?.value || "",
          __top: Date.now() - startedAtRef.current,
          pageUrl: window.location.href,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Unable to send the request.");
      }

      setIsSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      startedAtRef.current = Date.now();
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting lead:", error);
      setError(error instanceof Error ? error.message : "Unable to send the request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-[var(--surface)] rounded-lg p-6 border border-[var(--coastal-border)] shadow-medium ${className}`}>
      <h3 className="text-xl font-bold text-[var(--coastal-text)] mb-2">
        Get Property Updates
      </h3>
      <p className="text-sm text-[var(--coastal-muted-text)] mb-4">
        Ask about availability, showing options, or changes to a property you are following.
      </p>
      
      {isSuccess ? (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-800 dark:text-green-200 text-sm">
          Thank you! We'll be in touch soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="lead-company">Company</label>
            <input ref={honeypotRef} id="lead-company" tabIndex={-1} autoComplete="off" />
          </div>
          <div>
            <Label htmlFor="lead-name" className="text-sm text-[var(--coastal-text)]">
              Name
            </Label>
            <Input
              id="lead-name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="lead-email" className="text-sm text-[var(--coastal-text)]">
              Email
            </Label>
            <Input
              id="lead-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="lead-phone" className="text-sm text-[var(--coastal-text)]">
              Phone (Optional)
            </Label>
            <Input
              id="lead-phone"
              type="tel"
              placeholder="(858) 305-4362"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[var(--coastal-primary)] hover:bg-[var(--primary-hover)] text-white rounded-md font-semibold"
          >
            {isSubmitting ? "Sending..." : "Request Property Updates"}
          </Button>
          {error && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>}
          <p className="text-xs text-[var(--coastal-muted-text)] text-center mt-2">
            By submitting, you agree to be contacted about this inquiry. Read our{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-[var(--coastal-primary)]">
              privacy policy
            </Link>.
          </p>
        </form>
      )}
    </div>
  );
}

