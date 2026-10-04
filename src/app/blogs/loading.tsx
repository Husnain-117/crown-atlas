/**
 * /app/blogs/loading.tsx — Blog listing skeleton
 *
 * Prevents CLS while ISR revalidation or first-load fetches blog records.
 * Matches the card grid layout in blogs/page.tsx.
 */
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] theme-transition pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Page heading */}
        <Skeleton className="h-10 w-80 mb-3" />
        <Skeleton className="h-4 w-[480px] mb-10" />

        {/* Blog card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="space-y-3">
              {/* Thumbnail */}
              <Skeleton className="h-48 w-full rounded-xl" />
              {/* Category badge */}
              <Skeleton className="h-5 w-24 rounded-full" />
              {/* Title */}
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
              {/* Excerpt */}
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              {/* Author + date */}
              <div className="flex items-center gap-3 pt-1">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
