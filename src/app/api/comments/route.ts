import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { escapeContactHtml } from '@/lib/contact-inquiry'
import { notifyLeadInbox } from '@/lib/email'
import { getMongoDb } from '@/lib/mongodb'

const PostSchema = z.object({
  slug: z.string().trim().min(2).max(240),
  author_name: z.string().trim().min(2).max(80),
  body: z.string().trim().min(5).max(5000),
  company: z.string().max(200).optional().default(''),
})

interface BlogComment {
  slug: string
  author_name: string
  body: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: Date
}

const hits = new Map<string, { count: number; ts: number }>()
const WINDOW_MS = 60_000
const LIMIT = 5

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')?.trim()
  if (!slug) return NextResponse.json({ ok: false, error: 'slug required' }, { status: 400 })

  try {
    const db = await getMongoDb()
    const rows = await db.collection<BlogComment>('blog_comments')
      .find({ slug, status: 'approved' })
      .project({ author_name: 1, body: 1, created_at: 1 })
      .sort({ created_at: 1 })
      .limit(200)
      .toArray()

    return NextResponse.json({ ok: true, comments: rows })
  } catch (error) {
    console.error('[comments] Load failed', error)
    return NextResponse.json({ ok: false, error: 'Comments are temporarily unavailable.' }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
    const now = Date.now()
    const hit = hits.get(ip) || { count: 0, ts: now }
    if (now - hit.ts > WINDOW_MS) {
      hit.count = 0
      hit.ts = now
    }
    hit.count += 1
    hits.set(ip, hit)
    if (hit.count > LIMIT) {
      return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
    }

    const body = PostSchema.parse(await req.json())
    if (body.company) {
      return NextResponse.json({ ok: true, pending: true }, { status: 202 })
    }

    const db = await getMongoDb()
    await db.collection<BlogComment>('blog_comments').insertOne({
      slug: body.slug,
      author_name: body.author_name,
      body: body.body,
      status: 'pending',
      created_at: new Date(),
    })

    const notification = await notifyLeadInbox({
      subject: `New blog comment awaiting review: ${singleLine(body.slug)}`,
      html: `
        <h2>New Blog Comment</h2>
        <p><strong>Article:</strong> ${escapeContactHtml(body.slug)}</p>
        <p><strong>Name:</strong> ${escapeContactHtml(body.author_name)}</p>
        <h3>Comment</h3>
        <p>${escapeContactHtml(body.body).replace(/\n/g, '<br/>')}</p>
      `,
    })

    if (!notification.success) {
      console.error('[comments] Lead inbox notification failed', notification.error)
      return NextResponse.json({ ok: false, error: 'notification_failed' }, { status: 502 })
    }

    return NextResponse.json({ ok: true, pending: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'invalid_comment' }, { status: 400 })
    }
    console.error('[comments] Submission failed', error)
    return NextResponse.json({ ok: false, error: 'submission_failed' }, { status: 500 })
  }
}

function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}
