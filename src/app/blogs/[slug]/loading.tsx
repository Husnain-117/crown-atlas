/**
 * /app/blogs/[slug]/loading.tsx — Blog post detail skeleton
 *
 * Prevents CLS on individual blog post pages during ISR revalidation
 * or first-time slug rendering.
 */
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <article className="min-h-screen bg-[var(--bg)] theme-transition pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Breadcrumbs */}
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Category badge */}
        <Skeleton className="h-6 w-24 rounded-full mb-4" />

        {/* Title */}
        <Skeleton className="h-9 w-full mb-2" />
        <Skeleton className="h-9 w-5/6 mb-6" />

        {/* Author + meta */}
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        {/* Hero image */}
        <Skeleton className="h-72 md:h-96 w-full rounded-2xl mb-10" />

        {/* Article body */}
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className={`h-4 ${i % 5 === 4 ? "w-3/4" : "w-full"}`} />
          ))}
          <Skeleton className="h-4 w-0" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={`b${i}`} className={`h-4 ${i % 4 === 3 ? "w-2/3" : "w-full"}`} />
          ))}
        </div>
      </div>
    </article>
  );
}
