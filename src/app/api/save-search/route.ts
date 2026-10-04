import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPool } from '@/lib/db';
import { z } from 'zod';
import { savedSearchSchema } from '@/lib/saved-search';
import { escapeContactHtml } from '@/lib/contact-inquiry';
import { notifyLeadInbox } from '@/lib/email';

/**
 * POST /api/save-search
 * Saves a search with email alerts (anonymous, no login required)
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body?.company === 'string' && body.company.trim()) {
      return NextResponse.json({ success: true }, { status: 202 });
    }
    const validated = savedSearchSchema.parse(body);
    if (validated.__top !== undefined && validated.__top < 750) {
      return NextResponse.json({ success: true }, { status: 202 });
    }

    const pool = await getPool();
    
    const email = validated.email.toLowerCase();
    const filtersJson = JSON.stringify(validated.filters);

    const recentCount = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM saved_searches
       WHERE LOWER(email) = $1 AND created_at > NOW() - INTERVAL '24 hours'`,
      [email]
    );
    if (Number(recentCount.rows[0]?.count || 0) >= 10) {
      return NextResponse.json(
        { success: false, message: 'Too many alerts were created for this email. Please try again later.' },
        { status: 429 }
      );
    }

    const existing = await pool.query(
      `SELECT id
       FROM saved_searches
       WHERE LOWER(email) = $1 AND filters = $2::jsonb AND active = TRUE
       LIMIT 1`,
      [email, filtersJson]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'This daily alert is already active for that email.' },
        { status: 409 }
      );
    }

    const result = await pool.query(
      `INSERT INTO saved_searches (email, label, filters)
       VALUES ($1, $2, $3::jsonb)
       RETURNING id, token`,
      [email, validated.label || null, filtersJson]
    );

    const notification = await notifyLeadInbox({
      replyTo: email,
      subject: `New saved search: ${singleLine(validated.label || validated.filters.city || validated.filters.county || 'Website search')}`,
      html: `
        <h2>New Saved Search</h2>
        <p><strong>Email:</strong> ${escapeContactHtml(email)}</p>
        <p><strong>Label:</strong> ${escapeContactHtml(validated.label || 'Not provided')}</p>
        <p><strong>Source page:</strong> ${escapeContactHtml(request.headers.get('referer') || 'Not provided')}</p>
        <h3>Filters</h3>
        <pre>${escapeContactHtml(JSON.stringify(validated.filters, null, 2))}</pre>
      `,
    });

    if (!notification.success) {
      console.error('[save-search] Lead inbox notification failed', notification.error);
      return NextResponse.json(
        { success: false, message: 'The alert was saved, but the notification could not be delivered.' },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      id: result.rows[0].id,
      message: 'Daily listing alert created.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error saving search:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save search' },
      { status: 500 }
    );
  }
}

function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}
