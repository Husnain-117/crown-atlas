import Image from "next/image"
import Link from "next/link"
import { MapPin, ArrowRight } from "lucide-react"

export interface NeighborhoodCardProps {
  name: string
  description: string
  image?: string
  cityName: string
  category: string
  /** Canonical URL for the neighborhood detail page */
  href: string
  /** Set true for above-the-fold cards (LCP optimization) */
  priority?: boolean
}

/**
 * NeighborhoodCard — single reusable card used across all 107 neighborhoods.
 *
 * Used on:
 *  - /neighborhoods listing page (grid of all 107)
 *  - /neighborhoods/[city]/[neighborhood] related section
 *  - Any other page that features neighborhood cards
 */
export function NeighborhoodCard({
  name,
  description,
  image,
  cityName,
  category,
  href,
  priority = false,
}: NeighborhoodCardProps) {
  return (
    <Link
      href={href}
      className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coastal-secondary)] focus-visible:ring-offset-2 rounded-2xl"
    >
      <article className="h-full rounded-2xl overflow-hidden border border-[var(--coastal-border)] bg-[var(--surface)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
        {/* ── Image ── */}
        <div className="relative h-48 overflow-hidden flex-shrink-0">
          <Image
            src={image || "/luxury-modern-house-exterior.png"}
            alt={`${name} neighborhood in ${cityName}, California`}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Overlay text */}
          <div className="absolute bottom-3 left-3 right-3">
            <span className="inline-block bg-white/90 dark:bg-slate-800/90 text-[var(--coastal-primary)] text-xs font-semibold px-2.5 py-1 rounded-full mb-1.5">
              {category}
            </span>
            <h3 className="text-lg font-bold text-white drop-shadow-md line-clamp-1">{name}</h3>
            <div className="flex items-center gap-1 text-white/85 text-xs mt-0.5">
              <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden />
              <span className="truncate">{cityName}</span>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-5 flex flex-col flex-1">
          <p className="text-[var(--coastal-muted-text)] text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
            {description}
          </p>
          <div className="flex items-center text-[var(--coastal-primary)] dark:text-[var(--coastal-secondary)] font-semibold text-sm gap-1 group-hover:gap-2 transition-all mt-auto">
            <span>Explore {name}</span>
            <ArrowRight className="h-4 w-4 flex-shrink-0 group-hover:translate-x-1 transition-transform" aria-hidden />
          </div>
        </div>
      </article>
    </Link>
  )
}
