import assert from 'node:assert/strict'
import Module from 'node:module'
import { NextRequest } from 'next/server'

async function main() {
  const calls: { sql: string; values: unknown[] }[] = []
  let fail = false
  const pool = { query: async (sql: string, values: unknown[] = []) => {
    calls.push({ sql, values })
    if (fail) throw new Error('Database unavailable')
    if (sql.includes('listing_history_events')) return { rows: [
      { observed_at: '2026-09-12T00:00:00Z', old_value: 1000000, new_value: 950000 },
    ] }
    if (sql.includes('TO_REGCLASS')) return { rows: [{ exists: true }] }
    if (/COUNT\(/i.test(sql)) return { rows: [{ count: '1' }] }
    return { rows: [{ listing_key: '123', address: 'Test home', city: 'San Diego', state: 'CA',
      list_price: 950000, bedrooms_total: 3, bathrooms_total: 2, living_area: 1500,
      main_photo_url: 'https://3ohoto.sfo3.cdn.digitaloceanspaces.com/properties/123/01.jpg',
      media_urls: [], modification_timestamp: '2026-09-12T00:00:00Z' }] }
  } }
  const modules = Module as unknown as { _load: (id: string, ...args: unknown[]) => unknown }
  const original = modules._load
  modules._load = function(id: string, ...args: unknown[]) {
    if (id === '@/lib/db') return { getPgPool: async () => pool, isDatabaseConfigured: () => true }
    return original.call(this, id, ...args)
  }
  try {
    const { GET } = await import('../../app/api/listings/[id]/price-history/route')
    const request = new NextRequest('https://crowncoastalhomes.com/api/listings/123/price-history')
    const response = await GET(request, { params: Promise.resolve({ id: '123' }) })
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), [{ date: '2026-09-12T00:00:00.000Z', price: 950000, event: 'Price Reduced', change: -50000 }])
    assert.equal((await GET(request, { params: Promise.resolve({ id: "123' OR 1=1" }) })).status, 400)
    fail = true
    assert.equal((await GET(request, { params: Promise.resolve({ id: '123' }) })).status, 503)
    fail = false
    const { fetchNewListings } = await import('../crmls')
    const since = new Date('2026-09-11T00:00:00Z')
    const listings = await fetchNewListings({ city: "O'Fallon", action: 'buy', since, minPrice: 700000, type: 'Townhouse' }, { throwOnError: true })
    assert.equal(listings[0].photos[0], 'https://3ohoto.sfo3.cdn.digitaloceanspaces.com/properties/123/01.jpg')
    const query = calls.find(c => c.sql.includes('modification_timestamp >'))!
    assert.ok(query)
    assert.ok(query.values.includes(since.toISOString()))
    assert.ok(query.values.includes("O'Fallon"))
    assert.ok(query.values.includes('Townhouse'))
    assert.equal(query.sql.includes("O'Fallon"), false)
  } finally { modules._load = original }
  console.log('photoDataRoutes.test.ts: all assertions passed')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
