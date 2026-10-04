/**
 * CountyRentSkeleton — loading skeleton shown inside <Suspense>
 * while the heavy county-rent data streams in.
 */

export default function CountyRentSkeleton() {
  return (
    <div className="bg-[var(--surface-muted)] min-h-screen pb-24 lg:pb-0 animate-pulse">
      {/* FilterBar placeholder */}
      <div className="sticky top-0 z-40 bg-[var(--bg)] border-b border-[var(--coastal-border)] shadow-sm h-14" />

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-6">
              <div className="h-9 w-80 bg-[var(--coastal-border)] rounded-xl" />
              <div className="h-5 w-48 bg-[var(--coastal-border)] rounded-lg mt-3" />
            </div>

            {/* Properties Grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border border-[var(--coastal-border)] bg-[var(--surface)]"
                >
                  <div className="h-48 bg-[var(--surface-muted)]" />
                  <div className="p-4 space-y-3">
                    <div className="h-6 w-24 bg-[var(--coastal-border)] rounded" />
                    <div className="h-4 w-full bg-[var(--coastal-border)] rounded" />
                    <div className="flex gap-4">
                      <div className="h-4 w-16 bg-[var(--coastal-border)] rounded" />
                      <div className="h-4 w-16 bg-[var(--coastal-border)] rounded" />
                      <div className="h-4 w-16 bg-[var(--coastal-border)] rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="w-full lg:w-[340px] shrink-0 space-y-6">
            <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--coastal-border)] shadow-sm">
              <div className="h-6 w-40 bg-[var(--coastal-border)] rounded-lg mb-4" />
              <div className="space-y-4">
                <div className="h-8 w-32 bg-[var(--coastal-border)] rounded" />
                <div className="h-px bg-[var(--coastal-border)]" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-12 bg-[var(--coastal-border)] rounded" />
                  <div className="h-12 bg-[var(--coastal-border)] rounded" />
                </div>
              </div>
            </div>
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--coastal-border)] p-5 shadow-sm h-64" />
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--coastal-border)] p-5 shadow-sm h-48" />
          </div>
        </div>
      </div>
    </div>
  )
}
