/**
 * Loading skeleton for city discovery pages
 * Uses visual skeleton UI instead of indexable text to prevent SEO issues
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Hero skeleton */}
      <div className="h-[60vh] min-h-[400px] bg-[var(--surface-muted)] animate-pulse" />
      
      {/* Content skeleton */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Trust bar skeleton */}
        <div className="h-20 bg-[var(--surface-muted)] rounded-2xl mb-8 animate-pulse" />
        
        {/* Intro section skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-[var(--surface-muted)] rounded-lg w-3/4 animate-pulse" />
            <div className="h-4 bg-[var(--surface-muted)] rounded-lg w-full animate-pulse" />
            <div className="h-4 bg-[var(--surface-muted)] rounded-lg w-5/6 animate-pulse" />
          </div>
          <div className="h-64 bg-[var(--surface-muted)] rounded-2xl animate-pulse" />
        </div>
        
        {/* Properties grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-48 bg-[var(--surface-muted)] rounded-xl animate-pulse" />
              <div className="h-6 bg-[var(--surface-muted)] rounded-lg w-2/3 animate-pulse" />
              <div className="h-4 bg-[var(--surface-muted)] rounded-lg w-full animate-pulse" />
            </div>
          ))}
        </div>
        
        {/* Market stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-[var(--surface-muted)] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
