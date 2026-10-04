import { CalendarClock, Database, History } from "lucide-react"
import type { PropertyDetailData } from "@/lib/db/property-detail-repo"
import {
  getListingHistoryEvents,
  getPropertyListingEpisodes,
  type ListingHistoryEvent,
} from "@/lib/db/listing-history-repo"

const FIELD_LABELS: Record<string, string> = {
  list_price: "List price",
  standard_status: "Listing status",
  hoa_fee: "HOA fee",
  hoa_fee_frequency: "HOA frequency",
  tax_annual_amount: "Annual property tax",
  school_district: "School district",
  elementary_school: "Elementary school",
  middle_school: "Middle school",
  high_school: "High school",
  close_price: "Recorded close price",
  close_date: "Close date",
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function scalarValue(value: unknown): unknown {
  if (value && typeof value === "object" && "value" in value) {
    return (value as { value: unknown }).value
  }
  return value
}

function formatEventValue(event: ListingHistoryEvent, value: unknown): string {
  const scalar = scalarValue(value)
  if (scalar == null || scalar === "") return "Not reported"
  if (["list_price", "hoa_fee", "tax_annual_amount", "close_price"].includes(event.fieldName)) {
    const amount = Number(scalar)
    if (Number.isFinite(amount)) return formatMoney(amount)
  }
  return String(scalar)
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Not reported"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not reported"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  }).format(date)
}

export default async function PropertyHistorySection({ property }: { property: PropertyDetailData }) {
  const [events, episodes] = await Promise.all([
    getListingHistoryEvents(property.listing_key, 40, property.property_entity_key),
    getPropertyListingEpisodes(property.property_entity_key),
  ])
  const legacyPriceEvents: ListingHistoryEvent[] = (property.price_history || []).map((entry, index) => ({
    id: `legacy-price-${index}`,
    eventType: "price",
    fieldName: "list_price",
    oldValue: null,
    newValue: entry.price,
    observedAt: entry.date,
    source: "CRMLS listing history",
  }))
  const timeline = (events.length > 0 ? events : legacyPriceEvents)
    .filter((event) => event.observedAt)
    .filter((event) => {
      if (event.fieldName !== "hoa_fee") return true
      const oldAmount = Number(scalarValue(event.oldValue) ?? 0)
      const newAmount = Number(scalarValue(event.newValue) ?? 0)
      return oldAmount > 0 || newAmount > 0
    })
    .slice(0, 12)

  const currentFacts = [
    { label: "Current status", value: property.standard_status || property.mls_status },
    { label: "Current list price", value: property.list_price ? formatMoney(property.list_price) : "Not reported" },
    {
      label: property.tax_year ? `Property tax (${property.tax_year})` : "Annual property tax",
      value: property.tax_annual_amount && property.tax_annual_amount > 0
        ? formatMoney(property.tax_annual_amount)
        : "Not reported",
    },
    {
      label: "HOA",
      value: property.hoa_fee && property.hoa_fee > 0
        ? `${formatMoney(property.hoa_fee)}${property.hoa_fee_frequency ? ` ${property.hoa_fee_frequency.toLowerCase()}` : ""}`
        : property.association_yn === false
          ? "No HOA reported"
          : "Not reported",
    },
    { label: "School district", value: property.school_district || "Not reported" },
    { label: "Data updated", value: formatDate(property.modification_timestamp || property.updated_at) },
  ]

  return (
    <section className="rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] p-5 sm:p-6" aria-labelledby="property-history-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="property-history-title" className="flex items-center gap-2 text-xl font-bold text-[var(--coastal-text)]">
            <History aria-hidden="true" className="h-5 w-5 text-[var(--coastal-accent-text)]" />
            Property history and records
          </h2>
          <p className="mt-1 text-sm text-[var(--coastal-muted-text)]">
            Current and historical fields retained from CRMLS listing updates.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--coastal-muted-text)]">
          <Database aria-hidden="true" className="h-4 w-4" /> CRMLS/Trestle
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
        {currentFacts.map((fact) => (
          <div key={fact.label} className="border-b border-[var(--coastal-border)] py-3">
            <dt className="text-xs font-medium text-[var(--coastal-muted-text)]">{fact.label}</dt>
            <dd className="mt-1 text-sm font-semibold text-[var(--coastal-text)]">{fact.value}</dd>
          </div>
        ))}
      </dl>

      {episodes.length > 1 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[var(--coastal-text)]">MLS listing episodes</h3>
          <div className="mt-3 overflow-x-auto border-y border-[var(--coastal-border)]">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-xs text-[var(--coastal-muted-text)]">
                <tr>
                  <th className="px-3 py-2 font-medium">On market</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Original list</th>
                  <th className="px-3 py-2 font-medium">Latest list</th>
                  <th className="px-3 py-2 font-medium">Close</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--coastal-border)]">
                {episodes.map((episode) => (
                  <tr key={episode.listingKey}>
                    <td className="px-3 py-3">{formatDate(episode.onMarketDate)}</td>
                    <td className="px-3 py-3">{episode.status || "Not reported"}</td>
                    <td className="px-3 py-3">{episode.originalListPrice ? formatMoney(episode.originalListPrice) : "Not reported"}</td>
                    <td className="px-3 py-3">{episode.latestListPrice ? formatMoney(episode.latestListPrice) : "Not reported"}</td>
                    <td className="px-3 py-3">{episode.closePrice ? formatMoney(episode.closePrice) : "Not reported"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {timeline.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[var(--coastal-text)]">Recorded changes</h3>
          <ol className="mt-3 divide-y divide-[var(--coastal-border)] border-y border-[var(--coastal-border)]">
            {timeline.map((event) => (
              <li key={event.id} className="grid gap-1 py-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--coastal-muted-text)]">
                  <CalendarClock aria-hidden="true" className="h-3.5 w-3.5" />
                  {formatDate(event.observedAt)}
                </span>
                <span className="text-sm text-[var(--coastal-text)]">
                  <strong>{FIELD_LABELS[event.fieldName] || event.fieldName}:</strong>{" "}
                  {event.oldValue != null && (
                    <span className="text-[var(--coastal-muted-text)] line-through">
                      {formatEventValue(event, event.oldValue)}{" "}
                    </span>
                  )}
                  {formatEventValue(event, event.newValue)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-[var(--coastal-muted-text)]">
        Listing data can change. Tax, HOA, school, status, and sale information must be independently verified with the responsible authority and transaction documents.
      </p>
    </section>
  )
}
