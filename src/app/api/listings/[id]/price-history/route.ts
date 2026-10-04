import { NextRequest, NextResponse } from 'next/server'
import { getPgPool } from '@/lib/db'

/** Listing price changes already recorded by the DigitalOcean importer. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[A-Za-z0-9._:-]{1,160}$/.test(id)) {
    return NextResponse.json({ error: 'Valid listing ID required' }, { status: 400 })
  }
  try {
    const pool = await getPgPool()
    const result = await pool.query(`SELECT h.observed_at, h.old_value, h.new_value
      FROM listing_history_events h JOIN properties p USING (listing_key)
      WHERE h.listing_key=$1 AND h.field_name='list_price' AND p.standard_status='Active'
      ORDER BY h.observed_at ASC, h.id ASC LIMIT 100`, [id])
    const history = result.rows.flatMap(row => {
      const price = Number(row.new_value)
      const previous = Number(row.old_value)
      if (!Number.isFinite(price) || price <= 0) return []
      const change = previous > 0 ? price - previous : null
      return [{ date: new Date(row.observed_at).toISOString(), price,
        event: change === null ? 'Listed' : change < 0 ? 'Price Reduced' : change > 0 ? 'Price Increased' : 'Price Updated', change }]
    })
    return NextResponse.json(history, { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600' } })
  } catch {
    return NextResponse.json({ error: 'Price history temporarily unavailable' }, {
      status: 503, headers: { 'Cache-Control': 'no-store' },
    })
  }
}
