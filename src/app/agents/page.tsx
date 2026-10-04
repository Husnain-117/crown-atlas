import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BadgeCheck, Mail, Phone } from "lucide-react"

import { CONTACT } from "@/lib/constants/contact"

export const metadata: Metadata = {
  title: "California Real Estate Agent | Crown Coastal Homes",
  description: `Connect with ${CONTACT.agent.name}, a licensed California real estate agent (DRE #${CONTACT.agent.dre}) serving San Diego and coastal California.`,
  openGraph: {
    title: "California Real Estate Agent | Crown Coastal Homes",
    description: `Meet ${CONTACT.agent.name}, CA DRE #${CONTACT.agent.dre}.`,
  },
  alternates: { canonical: "/agents" },
}

const serviceLinks = [
  ["Search current listings", "/properties"],
  ["Request a home value review", "/home-valuation"],
  ["Review buying services", "/services/concierge-home-buying"],
  ["Review selling services", "/sell"],
] as const

export default function AgentsPage() {
  const agent = CONTACT.agent

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--coastal-text)]">
      <section className="border-b border-[var(--coastal-border)] bg-[var(--surface)] px-4 py-14 sm:py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-lg border border-[var(--coastal-border)] bg-[var(--surface-muted)]">
            <Image
              src={agent.avatarUrl}
              alt={agent.name}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 380px"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase text-[var(--coastal-primary)]">Crown Coastal Homes</p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-tight sm:text-5xl">{agent.name}</h1>
            <p className="mt-3 text-xl font-semibold text-[var(--coastal-primary)]">{agent.title}</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-[var(--coastal-border)] bg-[var(--bg)] px-3 py-2 text-sm font-medium">
              <BadgeCheck className="h-4 w-4 text-[var(--coastal-primary)]" aria-hidden />
              California DRE #{agent.dre}
            </div>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--coastal-muted-text)] sm:text-lg">
              Property search, tour requests, offer and listing guidance, and transaction coordination for clients in San Diego and coastal California.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={CONTACT.phone.href} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--coastal-primary)] px-5 py-3 font-semibold text-white hover:opacity-90">
                <Phone className="h-4 w-4" aria-hidden />
                {CONTACT.phone.display}
              </a>
              <a href={CONTACT.email.href} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--coastal-border)] bg-[var(--bg)] px-5 py-3 font-semibold hover:bg-[var(--surface-muted)]">
                <Mail className="h-4 w-4" aria-hidden />
                Email Reza
              </a>
              <Link href="/team/reza-barghlameno" className="inline-flex min-h-11 items-center justify-center gap-2 px-3 py-3 font-semibold text-[var(--coastal-primary)] hover:underline">
                Full agent profile
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:py-16" aria-labelledby="agent-services">
        <div className="mx-auto max-w-6xl">
          <h2 id="agent-services" className="font-display text-2xl font-bold sm:text-3xl">Start With Your Current Task</h2>
          <div className="mt-7 grid gap-x-10 gap-y-2 sm:grid-cols-2">
            {serviceLinks.map(([label, href]) => (
              <Link key={href} href={href} className="flex min-h-14 items-center justify-between border-b border-[var(--coastal-border)] font-semibold hover:text-[var(--coastal-primary)]">
                {label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--coastal-primary)] px-4 py-12 text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Discuss a Property or Search</h2>
            <p className="mt-2 max-w-2xl text-white/80">Send the location, listing link, timeframe, and questions you want to review.</p>
          </div>
          <Link href="/contact" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-[var(--coastal-primary)] hover:bg-white/90">
            Contact Crown Coastal
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  )
}
