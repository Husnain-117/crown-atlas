import { ClipboardCheck, RefreshCw } from "lucide-react"
import type { LandingData } from "@/types/landing"
import { getLocalMarketEditorial } from "@/lib/seo/local-market-editorial"

function formatDate(value?: string): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  }).format(date)
}

export default function LocalMarketEditorial({ data }: { data: LandingData }) {
  const editorial = getLocalMarketEditorial(data.city)
  if (!editorial) return null

  const updated = formatDate(data.stats?.lastUpdated)

  return (
    <section className="border-y border-[var(--coastal-border)] py-8" aria-labelledby="local-market-review-title">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)]">
        <div>
          <p className="text-xs font-semibold uppercase text-[var(--coastal-accent-text)]">Local market analysis</p>
          <h2 id="local-market-review-title" className="mt-2 text-2xl font-bold text-[var(--coastal-text)] sm:text-3xl">
            What to review in {data.city}
          </h2>
          <p className="mt-4 leading-7 text-[var(--coastal-muted-text)]">{editorial.overview}</p>
          <ul className="mt-5 space-y-3">
            {editorial.reviewPoints.map((point) => (
              <li key={point} className="flex gap-3 text-sm leading-6 text-[var(--coastal-text)]">
                <ClipboardCheck aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[var(--coastal-accent-text)]" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <aside className="border-l-2 border-[var(--coastal-secondary)] pl-5">
          <h3 className="text-sm font-semibold text-[var(--coastal-text)]">Agent review focus</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--coastal-muted-text)]">{editorial.agentReview}</p>
          <div className="mt-5 space-y-2 border-t border-[var(--coastal-border)] pt-4 text-xs leading-5 text-[var(--coastal-muted-text)]">
            <p className="flex items-start gap-2">
              <RefreshCw aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {updated ? "MLS source updated " + updated + "." : "MLS source timing is shown when the feed reports it."}
            </p>
            <p>
              Sources: <a className="font-semibold text-[var(--coastal-accent-text)] hover:underline" href="/about/data-methodology">CRMLS data methodology</a>{" and "}
              <a className="font-semibold text-[var(--coastal-accent-text)] hover:underline" href={editorial.officialUrl} target="_blank" rel="noopener noreferrer">{editorial.officialLabel}</a>.
            </p>
            <p>Editorial review: Crown Coastal Homes. Property-specific facts require independent verification.</p>
          </div>
        </aside>
      </div>
    </section>
  )
}
