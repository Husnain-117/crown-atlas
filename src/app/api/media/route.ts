import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { getPgPool } from '@/lib/db'
import { buildPropertyMediaUrls } from '@/lib/property-normalization'
import { isStoredPropertyPhoto } from '@/lib/property-photo'

export const runtime = 'nodejs'

const storedPhotos = unstable_cache(async (listingKey: string) => {
  const pool = await getPgPool()
  const result = await pool.query(
    `SELECT main_photo_url, media_urls FROM properties
     WHERE listing_key = $1 AND standard_status = 'Active' LIMIT 1`, [listingKey])
  return result.rows[0] ? buildPropertyMediaUrls(result.rows[0]).filter(isStoredPropertyPhoto) : []
}, ['stored-property-photos-v1'], { revalidate: 300, tags: ['properties'] })

function redirectToPhoto(url: string) {
  return new NextResponse(null, { status: 307, headers: {
    Location: url, 'Cache-Control': 'public, max-age=300, s-maxage=3600',
  } })
}

/** Compatibility for old cached pages; current pages load the Spaces CDN directly. */
export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams
  let listingKey = search.get('listingKey') || ''
  const raw = search.get('url')
  if (raw) {
    if (isStoredPropertyPhoto(raw)) return redirectToPhoto(raw)
    try {
      const url = new URL(raw)
      if (url.protocol !== 'https:' || !['api.cotality.com', 'api-trestle.corelogic.com'].includes(url.hostname)) {
        return NextResponse.json({ error: 'Unsupported photo source' }, { status: 400 })
      }
      listingKey = url.pathname.match(/\/Media\/Property\/[^/]+\/([^/]+)/i)?.[1] || ''
    } catch { return NextResponse.json({ error: 'Invalid photo source' }, { status: 400 }) }
  }
  if (!/^[A-Za-z0-9._:-]{1,160}$/.test(listingKey)) {
    return NextResponse.json({ error: 'Valid listing key required' }, { status: 400 })
  }
  const index = Number(search.get('object') || 1)
  if (!Number.isInteger(index) || index < 1 || index > 200) {
    return NextResponse.json({ error: 'Invalid photo number' }, { status: 400 })
  }
  try {
    const photos = await storedPhotos(listingKey)
    const photo = photos[index - 1]
    if (photo) return redirectToPhoto(photo)
    return new NextResponse(null, { status: 404, headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } })
  } catch {
    return NextResponse.json({ error: 'Photo lookup temporarily unavailable' }, {
      status: 503, headers: { 'Cache-Control': 'no-store' },
    })
  }
}
