import assert from 'node:assert/strict'
import { openHouseGroupDate, openHouseSchedule } from '../open-house-time'

// UTC has advanced to Sunday, but the California event is still Saturday.
for (const zone of ['Europe/Berlin', 'America/New_York', 'UTC']) {
  process.env.TZ = zone
  const schedule = openHouseSchedule('2026-09-13T01:00:00Z', '2026-09-13T03:00:00Z')!
  assert.equal(schedule.day, '2026-09-12')
  assert.equal(schedule.startTime, '6:00 PM PDT')
  assert.equal(schedule.endTime, '8:00 PM PDT')
  assert.equal(openHouseGroupDate(schedule.day), 'Saturday, September 12, 2026')
}
assert.equal(openHouseSchedule('2026-12-13T21:00:00Z')?.startTime, '1:00 PM PST')
assert.equal(openHouseSchedule('invalid'), null)
assert.equal(openHouseSchedule(null), null)
assert.equal(openHouseSchedule('2026-09-13T20:00:00Z', 'invalid')?.endIso, null)
assert.equal(openHouseSchedule('2026-09-13T20:00:00Z', '2026-09-13T19:00:00Z')?.endIso, null)
assert.equal(openHouseSchedule('2026-09-13T06:00:00Z', '2026-09-13T08:00:00Z')?.endDate, 'Sun, Sep 13, 2026')
console.log('openHouseTime.test.ts: all assertions passed')
