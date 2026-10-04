/**
 * Tour availability configuration.
 * v1: Static list of unavailable dates; replace with Google Calendar API or Calendly later.
 */

const UNAVAILABLE_DATES: string[] = [
  // Add ISO dates (YYYY-MM-DD) when Reza is unavailable.
  // Example: "2026-03-25", "2026-04-01"
]

export function getUnavailableDates(): string[] {
  return UNAVAILABLE_DATES
}

export const TIME_SLOTS = [
  { label: "9:00 AM", value: "09:00" },
  { label: "11:00 AM", value: "11:00" },
  { label: "1:00 PM", value: "13:00" },
  { label: "3:00 PM", value: "15:00" },
  { label: "5:00 PM", value: "17:00" },
] as const

export const TOUR_TYPES = [
  { label: "In-person", value: "in-person" },
  { label: "Virtual", value: "virtual" },
  { label: "Self-guided", value: "self-guided" },
] as const
