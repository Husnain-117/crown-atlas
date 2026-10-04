import Link from "next/link"
import { Building2, CheckCircle2 } from "lucide-react"
import type { PropertyDetailData } from "@/lib/db/property-detail-repo"
import { getPropertyComparables, type PropertyComparable } from "@/lib/db/property-comparables-repo"
import { propertyPathFor } from "@/lib/property-url"

function formatMoney(value: number | null): string {
  if (!value) return "Price not reported"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function ComparableList({ title, items, sold }: { title: string; items: PropertyComparable[]; sold?: boolean }) {
  if (items.length === 0) return null

  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-[var(--coastal-text)]">{title}</h3>
      <ul className="divide-y divide-[var(--coastal-border)] border-y border-[var(--coastal-border)]">
        {items.map((item) => (
          <li key={item.listingKey}>
            <Link
              href={propertyPathFor({ listing_key: item.listingKey, address: item.address, city: item.city })}
              className="grid min-h-16 gap-1 py-3 text-sm transition-colors hover:bg-[var(--surface-muted)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:px-2"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold text-[var(--coastal-text)]">{item.address}</span>
                <span className="text-xs text-[var(--coastal-muted-text)]">
                  {[item.bedrooms ? `${item.bedrooms} bd` : "", item.bathrooms ? `${item.bathrooms} ba` : "", item.livingArea ? `${Math.round(item.livingArea).toLocaleString("en-US")} sqft` : ""].filter(Boolean).join(" | ")}
                </span>
              </span>
              <span className="font-semibold text-[var(--coastal-text)]">
                {formatMoney(item.price)}{sold ? " sold" : ""}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function PropertyMarketContext({ property }: { property: PropertyDetailData }) {
  const comparables = await getPropertyComparables(
    property.listing_key,
    property.city,
    property.bedrooms,
    property.list_price,
    property.property_type,
    property.property_sub_type,
  )

  if (comparables.active.length === 0 && comparables.sold.length === 0) return null

  return (
    <section className="rounded-lg border border-[var(--coastal-border)] bg-[var(--surface)] p-5 sm:p-6" aria-labelledby="market-context-title">
      <h2 id="market-context-title" className="flex items-center gap-2 text-xl font-bold text-[var(--coastal-text)]">
        <Building2 aria-hidden="true" className="h-5 w-5 text-[var(--coastal-accent-text)]" />
        Similar homes and recent comparisons
      </h2>
      <p className="mt-1 text-sm text-[var(--coastal-muted-text)]">
        Same-city properties with matching listing type and similar bedroom counts, separated into current listings and recorded sales.
      </p>
      <div className="mt-5 grid gap-7 lg:grid-cols-2">
        <ComparableList title="Similar active homes" items={comparables.active} />
        <ComparableList title="Recently sold comparisons" items={comparables.sold} sold />
      </div>
      <p className="mt-4 flex items-start gap-1.5 text-xs leading-relaxed text-[var(--coastal-muted-text)]">
        <CheckCircle2 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Sold amounts use recorded close prices when available. These matches are orientation only, not an appraisal or comparative market analysis.
      </p>
    </section>
  )
}
