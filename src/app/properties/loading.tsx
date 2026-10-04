/**
 * /app/properties/loading.tsx — Property search results skeleton
 *
 * Shown while the properties listing page fetches initial results.
 * Mirrors the filter sidebar + property card grid layout.
 */
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] theme-transition pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Search / filter bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <Skeleton className="h-11 flex-1 rounded-lg" />
          <Skeleton className="h-11 w-36 rounded-lg" />
          <Skeleton className="h-11 w-36 rounded-lg" />
          <Skeleton className="h-11 w-28 rounded-lg" />
        </div>

        {/* Results meta */}
        <Skeleton className="h-5 w-48 mb-6" />

        {/* Property card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden space-y-3 border border-[var(--border)]">
              {/* Photo */}
              <Skeleton className="h-52 w-full rounded-none" />
              <div className="px-4 pb-4 space-y-2">
                {/* Price */}
                <Skeleton className="h-7 w-32" />
                {/* Address */}
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                {/* Beds / baths / sqft */}
                <div className="flex gap-4 pt-1">
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
