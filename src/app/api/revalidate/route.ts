import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * On-Demand ISR Revalidation Endpoint
 *
 * Secured with a shared secret token. Must be called with:
 *   POST /api/revalidate?secret=<REVALIDATE_SECRET>
 *   Body: { path?: string, tag?: string }
 *
 * - Use `tag` for targeted invalidation (e.g., after a blog post publish)
 * - Use `path` for full page rebuild (e.g., after a city data update)
 *
 * Set REVALIDATE_SECRET in Vercel Environment Variables (not exposed to browser).
 */

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET

export async function POST(req: Request) {
  try {
    // ── Security: Validate shared secret ──────────────────────────────────────
    const url = new URL(req.url)
    const secret = url.searchParams.get('secret')

    if (!REVALIDATE_SECRET) {
      // Fail loudly in production if the secret is not configured
      console.error('[revalidate] REVALIDATE_SECRET is not set in environment variables')
      return NextResponse.json(
        { ok: false, error: 'Server misconfiguration — secret not configured' },
        { status: 500 }
      )
    }

    if (secret !== REVALIDATE_SECRET) {
      console.warn('[revalidate] Unauthorized revalidation attempt')
      return NextResponse.json(
        { ok: false, error: 'Unauthorized — invalid or missing secret token' },
        { status: 401 }
      )
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    const body = await req.json().catch(() => ({}))
    const { path, tag } = body as { path?: string; tag?: string }

    if (!path && !tag) {
      return NextResponse.json(
        { ok: false, error: 'Provide at least one of: "path" or "tag"' },
        { status: 400 }
      )
    }

    const revalidated: string[] = []

    // ── Tag-based invalidation (preferred — granular, no layout rebuild) ──────
    if (tag && typeof tag === 'string') {
      revalidateTag(tag)
      revalidated.push(`tag:${tag}`)
    }

    // ── Path-based invalidation (full static page rebuild) ───────────────────
    if (path && typeof path === 'string') {
      revalidatePath(path)
      revalidated.push(`path:${path}`)
    }

    console.log('[revalidate] Success:', revalidated)

    return NextResponse.json({
      ok: true,
      revalidated,
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('[revalidate] Error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

