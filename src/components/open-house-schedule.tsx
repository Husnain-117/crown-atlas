import { CalendarDays } from 'lucide-react'
import type { openHouseSchedule } from '@/lib/open-house-time'

export function OpenHouseSchedule({ schedule }: { schedule: NonNullable<ReturnType<typeof openHouseSchedule>> }) {
  return (
    <div className="border-b border-[var(--coastal-border)] bg-[var(--surface-muted)] px-4 py-4 text-[var(--coastal-text)]">
      <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--coastal-primary)]">
        <CalendarDays className="h-4 w-4 shrink-0" aria-hidden /> Open house
      </p>
      <p className="text-sm font-semibold"><time dateTime={schedule.day}>{schedule.date}</time></p>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <dt className="text-xs text-[var(--coastal-muted-text)]">Starts</dt>
          <dd className="mt-1 text-sm font-semibold"><time dateTime={schedule.startIso}>{schedule.startTime}</time></dd>
        </div>
        <div className="min-w-0 border-l border-[var(--coastal-border)] pl-3">
          <dt className="text-xs text-[var(--coastal-muted-text)]">Ends</dt>
          <dd className="mt-1 text-sm font-semibold">
            {schedule.endIso ? (
              <time dateTime={schedule.endIso}>
                {schedule.endDate && <span className="block text-xs">{schedule.endDate}</span>}
                {schedule.endTime}
              </time>
            ) : <span className="font-normal">Not provided</span>}
          </dd>
        </div>
      </dl>
    </div>
  )
}
