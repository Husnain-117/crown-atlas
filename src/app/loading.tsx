/**
 * /app/loading.tsx — Homepage skeleton
 *
 * Shown by Next.js while the home page Server Component is fetching county
 * stats and featured properties.  Matches the visual structure of page.tsx
 * to prevent CLS (Cumulative Layout Shift).
 */
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] theme-transition">
      {/* Hero skeleton — full-viewport carousel placeholder */}
      <div className="relative h-screen w-full overflow-hidden">
        <Skeleton className="h-full w-full rounded-none" />
        {/* Search bar placeholder */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4">
          <Skeleton className="h-14 w-full rounded-full" />
        </div>
      </div>

      {/* Featured Properties section */}
      <section className="py-16 container mx-auto px-4">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96 mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-52 w-full rounded-xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </section>

      {/* Counties section */}
      <section className="py-12 container mx-auto px-4">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
