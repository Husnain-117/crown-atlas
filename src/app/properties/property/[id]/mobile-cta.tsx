"use client"

import { CalendarDays, Mail } from "lucide-react"

import { formatPriceWithCommasAndDecimals } from "@/lib/utils"
import { useContactPanel } from "@/stores/use-contact-panel"

interface MobileListingCtaProps {
  listingKey: string
  propertyAddress: string
  price?: number | null
  isActive: boolean
}

export function MobileListingCta({
  listingKey,
  propertyAddress,
  price,
  isActive,
}: MobileListingCtaProps) {
  const openContactPanel = useContactPanel((state) => state.open)
  const priceLabel = price && price > 0
    ? formatPriceWithCommasAndDecimals(price)
    : "Price on request"

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--coastal-border)] bg-[var(--surface)]/95 px-4 py-3 shadow-[0_-8px_24px_rgba(18,50,74,0.12)] backdrop-blur-md md:hidden safe-area-bottom">
      <div className="mx-auto flex max-w-xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-[var(--coastal-muted-text)]">
            {isActive ? "Available property" : "Property record"}
          </p>
          <p className="truncate text-base font-bold text-[var(--coastal-primary)]" title={priceLabel}>
            {priceLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openContactPanel({
            propertyKey: listingKey,
            propertyAddress,
            mode: isActive ? "tour" : "agent",
          })}
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--coastal-action)] px-4 text-sm font-bold text-white shadow-medium transition-colors hover:bg-[var(--coastal-action-hover)]"
        >
          {isActive ? <CalendarDays className="h-5 w-5" aria-hidden="true" /> : <Mail className="h-5 w-5" aria-hidden="true" />}
          {isActive ? "Book Visit" : "Ask Agent"}
        </button>
      </div>
    </div>
  )
}
