import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { POST as deliverContactEmail } from '../contact-info/route';
import { canadaLanderSchema, canadaLanderValues } from '@/lib/canada-lander';
import { buildCanadaConsultPayload } from '@/lib/canada-consult-inquiry';
import { isContactSpamProbe } from '@/lib/contact-inquiry';
import { captureLeadDeliveryError } from '@/lib/observability';
import { SITE_URL } from '@/lib/constants/site';

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  const startedAt = Date.now();
  const reply = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return reply({ success: false, error: 'Invalid enquiry.' }, 400);
    if (isContactSpamProbe(body)) return reply({ success: true }, 202);
    const parsed = canadaLanderSchema.safeParse(body);
    if (!parsed.success) return reply({ success: false, error: 'Please check the required fields.' }, 400);
    const lead = parsed.data;
    const emailPayload = buildCanadaConsultPayload(canadaLanderValues(lead) as Parameters<typeof buildCanadaConsultPayload>[0], {
      pageUrl: SITE_URL + lead.page, elapsedMs: body.__top ?? 1000, company: '',
      attribution: { utm_source: lead.utm_source, utm_campaign: lead.utm_campaign, utm_content: lead.utm_content },
    }, lead.city);
    // Deliver directly to the three existing lead inboxes and acknowledge confirmed email delivery.
    const emailResponse = await deliverContactEmail(new NextRequest(SITE_URL + '/api/contact-info', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(emailPayload),
    }));
    const delivered = await emailResponse.json();
    if (!emailResponse.ok || !delivered.requestId) return reply({ success: false, error: 'We could not confirm delivery.' }, 502);

    return reply({ success: true, requestId: delivered.requestId, delivery: 'email' });
  } catch {
    // Do not log the request body or contact information.
    captureLeadDeliveryError(new Error('Canada lander delivery not confirmed'), { route: '/api/canada-lander', requestId, kind: 'Canada lander', hasPropertyContext: false, durationMs: Date.now() - startedAt, stage: 'inbox' });
    return reply({ success: false, error: 'We could not confirm delivery. Please try again or email us.' }, 502);
  }
}
