import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({ provider: 'digitalocean-spaces',
    photosServedDirectly: true, trestleCallsFromVercel: false,
  }, { headers: { 'Cache-Control': 'public, max-age=3600' } })
}
