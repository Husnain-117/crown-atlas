export const MIN_INDEXABLE_FACET_LISTINGS = 8

export function shouldIndexLandingPage({
  priorityCity,
  priorityLanding,
  activeListings,
}: {
  priorityCity: boolean
  priorityLanding: boolean
  activeListings?: number
}): boolean {
  return Boolean(
    priorityCity &&
    priorityLanding &&
    Number.isFinite(activeListings) &&
    Number(activeListings) >= MIN_INDEXABLE_FACET_LISTINGS
  )
}
