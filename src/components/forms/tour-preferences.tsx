"use client"

import { useEffect, useState } from "react"
import { todayInTimeZone } from "@/lib/contact-context"

const fieldClass = "mt-1 min-h-11 w-full rounded-lg border border-[var(--coastal-border)] bg-[var(--surface-muted)] px-3 text-[var(--coastal-text)]"

export default function TourPreferences({ idPrefix }: { idPrefix: string }) {
  const [timeZone, setTimeZone] = useState("America/Los_Angeles")
  const [localTimeZone, setLocalTimeZone] = useState("America/Los_Angeles")
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Los_Angeles"
    setLocalTimeZone(detected)
    setTimeZone(detected)
  }, [])
  const zones = Array.from(new Set([localTimeZone, "Europe/London", "America/Los_Angeles"]))
  return (
    <fieldset className="space-y-4">
      <legend className="mb-2 text-sm font-semibold text-[var(--coastal-text)]">Your viewing preferences</legend>
      <label className="block text-sm text-[var(--coastal-text)]" htmlFor={`${idPrefix}-tour-type`}>
        Tour format
        <select id={`${idPrefix}-tour-type`} name="tourType" defaultValue="in-person" className={fieldClass}>
          <option value="in-person">In person</option>
          <option value="virtual">Live video tour</option>
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm text-[var(--coastal-text)]" htmlFor={`${idPrefix}-date`}>
          Preferred date
          <input id={`${idPrefix}-date`} name="preferredDate" type="date" min={todayInTimeZone(timeZone)} required className={fieldClass} />
        </label>
        <label className="block text-sm text-[var(--coastal-text)]" htmlFor={`${idPrefix}-time`}>
          Time (optional)
          <input id={`${idPrefix}-time`} name="preferredTime" type="time" className={fieldClass} />
        </label>
      </div>
      <label className="block text-sm text-[var(--coastal-text)]" htmlFor={`${idPrefix}-zone`}>
        Time zone for your request
        <select id={`${idPrefix}-zone`} name="timeZone" value={timeZone} onChange={event => setTimeZone(event.target.value)} className={fieldClass}>
          {zones.map(zone => <option key={zone} value={zone}>{zone === "Europe/London" ? "UK — London" : zone === "America/Los_Angeles" ? "California — Pacific Time" : zone.replace(/_/g, " ")}</option>)}
        </select>
      </label>
      <p className="text-xs leading-relaxed text-[var(--coastal-muted-text)]">Choose a date and time in the selected time zone. Reza will confirm availability and the meeting time; this request does not reserve an appointment.</p>
    </fieldset>
  )
}
