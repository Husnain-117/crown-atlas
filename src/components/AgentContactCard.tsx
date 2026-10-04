"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useContactPanel } from "@/stores/use-contact-panel";
import { CONTACT } from "@/lib/constants/contact";

interface AgentContactCardProps {
  className?: string;
  propertyAddress?: string;
  listingKey?: string;
}

export function AgentContactCard({ className = "", propertyAddress, listingKey }: AgentContactCardProps) {
  const openContactPanel = useContactPanel((state) => state.open);
  const propertySummary = propertyAddress
    ? `${propertyAddress}${listingKey ? ` (Listing ID: ${listingKey})` : ""}`
    : "";
  const emailHref = propertySummary
    ? `${CONTACT.email.href}?subject=${encodeURIComponent(`Property inquiry: ${propertySummary}`)}&body=${encodeURIComponent(`Hi Reza, I'm interested in ${propertySummary}. Please contact me with more information.`)}`
    : CONTACT.email.href;

  return (
    <div className={`p-6 rounded-2xl bg-white dark:bg-[#1e2e3e] border border-[var(--coastal-border)]/40 shadow-[0_4px_24px_rgba(0,0,0,0.07)] ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Avatar className="w-12 h-12 border-2 border-[var(--coastal-accent)]/20">
          <AvatarImage src="/agent.jpg" alt="Reza Barghlameno" />
          <AvatarFallback className="bg-[var(--coastal-accent)]/10 text-[var(--coastal-accent)] font-serif">RB</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-[var(--font-playfair)] text-xl font-bold text-[var(--coastal-text)] leading-tight">{CONTACT.agent.name}</h3>
          <p className="text-xs text-[var(--coastal-muted-text)] font-medium">eXp of California</p>
        </div>
      </div>

      <div className="space-y-3">
        <a href={CONTACT.phone.href} className="flex items-center text-sm text-[var(--coastal-text)] hover:text-[var(--coastal-primary)]">
          <div className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center mr-3 shrink-0">
            <Phone className="h-3.5 w-3.5 text-[var(--coastal-primary)]" />
          </div>
          <span className="font-medium">Call: {CONTACT.phone.display}</span>
        </a>
        
        <a href={emailHref} className="flex items-center text-sm text-[var(--coastal-text)] hover:text-[var(--coastal-primary)]">
          <div className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center mr-3 shrink-0">
            <Mail className="h-3.5 w-3.5 text-[var(--coastal-primary)]" />
          </div>
          <span className="font-medium break-all">Email: {CONTACT.email.display}</span>
        </a>
        
        <div className="flex items-center text-sm text-[var(--coastal-text)]">
          <div className="w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center mr-3 shrink-0">
            <Calendar className="h-3.5 w-3.5 text-[var(--coastal-primary)]" />
          </div>
          {propertySummary ? <Button type="button" variant="link" className="h-auto p-0 text-sm font-semibold text-[var(--coastal-accent-text)] hover:text-[var(--coastal-link)] transition-colors cursor-pointer"
            onClick={() => openContactPanel({ propertyKey: listingKey || "", propertyAddress: propertyAddress || "", mode: "tour" })}>
            Request a Tour
          </Button> : <Button asChild variant="link" className="h-auto p-0 text-sm font-semibold text-[var(--coastal-accent-text)] hover:text-[var(--coastal-link)] transition-colors cursor-pointer">
            <Link href="/contact?inquiry=tour">Request a Tour</Link>
          </Button>}
        </div>
      </div>
    </div>
  );
}
