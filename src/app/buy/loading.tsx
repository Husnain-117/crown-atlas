/**
 * /app/buy/loading.tsx — Buy listing page skeleton
 *
 * Matches the buy/page.tsx hero + county card grid layout.
 */
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] theme-transition">
      {/* Hero strip */}
      <div className="h-72 w-full relative overflow-hidden">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4">
          <Skeleton className="h-10 w-96 rounded-lg" />
          <Skeleton className="h-6 w-72 rounded-lg" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Section heading */}
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-80 mb-10" />

        {/* County / city cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-44 rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>

        {/* Property type pills */}
        <div className="flex flex-wrap gap-3 mt-12 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>

        {/* Featured listings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden space-y-3 border border-[var(--border)]">
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="px-4 pb-4 space-y-2">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
