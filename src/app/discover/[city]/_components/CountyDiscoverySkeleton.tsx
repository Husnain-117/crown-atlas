/**
 * CountyDiscoverySkeleton — loading skeleton shown while
 * <Suspense> resolves the heavy county data fetch.
 */

export default function CountyDiscoverySkeleton() {
  return (
    <div className="bg-[var(--bg)] theme-transition animate-pulse">
      {/* Hero skeleton */}
      <section className="relative min-h-[400px] bg-[var(--surface-muted)] rounded-b-2xl overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
            <div className="space-y-6 py-8">
              <div className="h-12 w-3/4 bg-[var(--coastal-border)] rounded-xl" />
              <div className="h-6 w-full bg-[var(--coastal-border)] rounded-lg" />
              <div className="h-6 w-2/3 bg-[var(--coastal-border)] rounded-lg" />
              <div className="flex gap-4 mt-8">
                <div className="h-12 w-40 bg-[var(--coastal-border)] rounded-xl" />
                <div className="h-12 w-40 bg-[var(--coastal-border)] rounded-xl" />
              </div>
            </div>
            <div className="hidden lg:block bg-[var(--surface)] rounded-2xl border border-[var(--coastal-border)] p-6">
              <div className="h-6 w-48 bg-[var(--coastal-border)] rounded-lg mb-4" />
              <div className="space-y-3">
                <div className="h-10 bg-[var(--coastal-border)] rounded-lg" />
                <div className="h-10 bg-[var(--coastal-border)] rounded-lg" />
                <div className="h-10 bg-[var(--coastal-border)] rounded-lg" />
                <div className="h-12 bg-[var(--coastal-border)] rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar skeleton */}
      <section className="mt-3">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="py-3 px-4 rounded-2xl border border-[var(--coastal-border)] bg-[var(--surface-muted)] h-10" />
        </div>
      </section>

      {/* City grid skeleton */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-16">
        <div className="h-10 w-64 bg-[var(--coastal-border)] rounded-xl mx-auto mb-4" />
        <div className="h-5 w-96 bg-[var(--coastal-border)] rounded-lg mx-auto mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl overflow-hidden border border-[var(--coastal-border)] bg-[var(--surface)]"
            >
              <div className="h-44 bg-[var(--surface-muted)]" />
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="h-8 w-14 bg-[var(--coastal-border)] rounded" />
                  <div className="h-8 w-14 bg-[var(--coastal-border)] rounded" />
                  <div className="h-8 w-14 bg-[var(--coastal-border)] rounded" />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 h-10 bg-[var(--coastal-border)] rounded-xl" />
                  <div className="flex-1 h-10 bg-[var(--coastal-border)] rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Market insights skeleton */}
      <section className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 mt-16 mb-24">
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--coastal-border)] p-8">
          <div className="h-8 w-48 bg-[var(--coastal-border)] rounded-xl mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-[var(--coastal-border)] rounded" />
                <div className="h-8 w-20 bg-[var(--coastal-border)] rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
