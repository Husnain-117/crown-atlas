import { Skeleton } from "@/components/ui/skeleton"

export function CityHeroTextSkeleton({ cityName, action = "buy" }: { cityName: string, action?: "buy" | "rent" }) {
  return (
    <div className="animate-fade-in">
      <Skeleton className="h-6 w-48 mb-4 rounded bg-[var(--surface-muted)]" />
      <div aria-hidden="true" className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--coastal-text)] leading-tight">
        {action === "buy" ? `Exploring ${cityName} Real Estate` : `Renting in ${cityName}`}
      </div>
      <Skeleton className="h-8 w-64 mt-2 rounded bg-[var(--surface-muted)]" />
      <Skeleton className="h-4 w-40 mt-4 rounded bg-[var(--surface-muted)]" />
      
      <div className="mt-5 space-y-2 max-w-[620px]">
        <Skeleton className="h-4 w-full rounded bg-[var(--surface-muted)]" />
        <Skeleton className="h-4 w-11/12 rounded bg-[var(--surface-muted)]" />
        <Skeleton className="h-4 w-4/5 rounded bg-[var(--surface-muted)]" />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <Skeleton className="h-10 w-32 rounded-md bg-[var(--coastal-primary)]/20" />
        <Skeleton className="h-10 w-48 rounded-md bg-[var(--surface-muted)]" />
      </div>
    </div>
  )
}

export function CityHeroOverlaySkeleton({ displayName }: { displayName: string }) {
  return (
    <>
      {/* City Title with fast load fallback */}
      <div className="absolute inset-x-0 top-[48%] -translate-y-1/2 text-center px-4 sm:px-6 z-10">
        <div className="text-white text-3xl sm:text-4xl font-extrabold drop-shadow-lg tracking-tight leading-tight">{displayName}</div>
        <Skeleton className="h-6 w-32 mx-auto mt-2 rounded-full bg-white/30" />
      </div>
      {/* Stats Card */}
      <div className="absolute left-4 right-4 sm:right-auto sm:left-6 bottom-4 sm:bottom-6 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md p-3 sm:p-4 sm:min-w-[220px] shadow-2xl border border-white/20 z-10">
        <div className="text-[10px] uppercase tracking-widest font-bold text-[var(--coastal-muted-text)] mb-1">Median Asking Price</div>
        <Skeleton className="h-8 w-24 rounded bg-gray-200 mt-1 mb-1" />
        <div className="text-xs font-semibold text-[var(--coastal-text)] mt-1">{displayName.replace(/(?:,\s*CA)+$/i, "")}, CA</div>
      </div>
    </>
  )
}

export function CityStatsBarSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border-t border-[var(--coastal-border)] bg-[var(--surface)]">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`px-6 py-4 ${i < 4 ? 'border-r border-[var(--coastal-border)]' : ''}`}>
          <Skeleton className="h-3 w-20 rounded bg-gray-200 mb-2" />
          <Skeleton className="h-8 w-24 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

export function CityRentStatsBarSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 border-t border-[var(--coastal-border)] bg-[var(--surface)]">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`px-6 py-4 ${i < 3 ? 'border-r border-[var(--coastal-border)]' : ''}`}>
          <Skeleton className="h-3 w-20 rounded bg-gray-200 mb-2" />
          <Skeleton className="h-8 w-24 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

export function CityEditorialSkeleton({ displayName }: { displayName: string }) {
  return (
    <div className="mt-10 mb-8 max-w-4xl mx-auto text-center flex flex-col items-center">
      <h2 className="text-3xl font-bold text-[var(--coastal-text)] mb-4">About {displayName}</h2>
      <div className="space-y-3 w-full max-w-3xl">
        <Skeleton className="h-5 w-full rounded bg-[var(--surface-muted)]" />
        <Skeleton className="h-5 w-11/12 mx-auto rounded bg-[var(--surface-muted)]" />
        <Skeleton className="h-5 w-4/5 mx-auto rounded bg-[var(--surface-muted)]" />
      </div>
    </div>
  )
}

export function PropertyCardSkeleton() {
  return (
    <div className="bg-[var(--surface)] rounded-[1rem] shadow-soft p-0 w-full flex flex-col border border-[var(--coastal-border)] overflow-hidden">
      <Skeleton className="h-64 w-full rounded-none" />
      <div className="p-6 flex flex-col flex-1 gap-4">
        <div>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div>
          <Skeleton className="h-8 w-1/3 mb-1" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex gap-3 pt-4 border-t border-[var(--coastal-border)] mt-auto">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}

export function CityListingsGridSkeleton() {
  return (
    <div className="mt-8 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-64 rounded bg-[var(--surface-muted)]" />
        <Skeleton className="h-4 w-32 rounded bg-[var(--surface-muted)]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map(i => <PropertyCardSkeleton key={i} />)}
      </div>
    </div>
  )
}

export function CityLifestyleSkeleton() {
  return (
    <div className="mt-10 grid md:grid-cols-2 gap-6">
      <div className="rounded-xl border border-[var(--coastal-border)] p-6 bg-[var(--surface)] h-48 flex flex-col">
        <Skeleton className="h-6 w-1/2 mb-4 bg-gray-200" />
        <Skeleton className="h-4 w-full mb-2 bg-gray-200" />
        <Skeleton className="h-4 w-11/12 bg-gray-200" />
      </div>
      <div className="rounded-xl border border-[var(--coastal-border)] p-6 bg-[var(--surface)] h-48 flex flex-col">
        <Skeleton className="h-6 w-1/2 mb-4 bg-gray-200" />
        <Skeleton className="h-4 w-full mb-2 bg-gray-200" />
        <Skeleton className="h-4 w-11/12 bg-gray-200" />
      </div>
    </div>
  )
}
