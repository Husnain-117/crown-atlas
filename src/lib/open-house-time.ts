const TIME_ZONE = 'America/Los_Angeles'
const dayFormatter = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
const dateFormatter = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
const timeFormatter = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })

function parseTimestamp(value?: string | null): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date : null
}

function dayKey(date: Date): string {
  const parts = dayFormatter.formatToParts(date)
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-')
}

export function openHouseSchedule(startValue?: string | null, endValue?: string | null) {
  const start = parseTimestamp(startValue)
  if (!start) return null
  const candidate = parseTimestamp(endValue)
  const end = candidate && candidate > start ? candidate : null
  return {
    day: dayKey(start),
    date: dateFormatter.format(start),
    startIso: start.toISOString(),
    startTime: timeFormatter.format(start),
    endIso: end?.toISOString() ?? null,
    endTime: end ? timeFormatter.format(end) : null,
    endDate: end && dayKey(end) !== dayKey(start) ? dateFormatter.format(end) : null,
  }
}

export function openHouseGroupDate(day: string): string {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}
