import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

// Runs on the Vercel Edge Network — zero cold-start, near-instant OG image gen
export const runtime = 'edge'

// Cache generated images for 72 hours at the CDN layer
export const revalidate = 259200

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Parameters injected by generateMetadata in california/[city]/[landing]/page.tsx
  const city    = searchParams.get('city')    ?? 'California'
  const landing = searchParams.get('landing') ?? 'Homes for Sale'
  const tagline = searchParams.get('tag')     ?? 'Luxury Real Estate · Southern California'

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0a1628 0%, #0d2347 60%, #0a3356 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative wave overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '180px',
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,180,200,0.08) 100%)',
            borderTop: '1px solid rgba(0,180,200,0.18)',
          }}
        />

        {/* Top accent bar */}
        <div
          style={{
            display: 'flex',
            height: '6px',
            background: 'linear-gradient(90deg, #00b4c8, #0080aa, #00b4c8)',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            padding: '62px 80px 56px',
            justifyContent: 'space-between',
          }}
        >
          {/* Brand mark */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* Crown icon (SVG inline as a simple gold crown shape) */}
            <svg
              width="40"
              height="34"
              viewBox="0 0 40 34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 30L8 14L16 22L20 8L24 22L32 14L36 30H4Z"
                fill="#D4AF37"
                stroke="#B8960C"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#D4AF37',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Crown Coastal Homes
            </span>
          </div>

          {/* Hero text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* City name */}
            <div
              style={{
                fontSize: '72px',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.0,
                letterSpacing: '-0.02em',
              }}
            >
              {city}
            </div>

            {/* Landing type pill */}
            <div style={{ display: 'flex' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(0,180,200,0.18)',
                  border: '1.5px solid rgba(0,180,200,0.6)',
                  borderRadius: '100px',
                  padding: '10px 28px',
                }}
              >
                <span
                  style={{
                    fontSize: '30px',
                    fontWeight: 600,
                    color: '#7ee8f5',
                    letterSpacing: '0.01em',
                  }}
                >
                  {landing}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <span
              style={{
                fontSize: '20px',
                color: 'rgba(255,255,255,0.55)',
                letterSpacing: '0.04em',
              }}
            >
              {tagline}
            </span>
            <span
              style={{
                fontSize: '18px',
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.04em',
              }}
            >
              crowncoastalhomes.com
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        // Cache at CDN for 72 h; browser for 24 h
        'Cache-Control': 'public, s-maxage=259200, max-age=86400, stale-while-revalidate=604800',
      },
    },
  )
}
