import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/canada-lander/route';
import { buildCanadaLanderPayload, canadaRoutingTags } from '../canada-lander';
import { canadaConsultSchemaForRegion } from '../canada-consult-inquiry';
import { CANADA_CONSULT_REGIONS, type CanadaConsultRegion } from '../canada-consult-regions';
import { CANADA_LANDER_PATHS, CANADA_LANDER_SUCCESS, isCanadaLanderPath } from '../canada-lander-content';
import { ADMIN_EMAILS } from '../email';

async function main() {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  const emails: Record<string, unknown>[] = [];
  let emailFails = false;
  let confirmationFails = false;
  process.env.RESEND_API_KEY = 're_test_canada_lander';
  globalThis.fetch = async (input, init) => {
    assert.equal(String(input), 'https://api.resend.com/emails', 'the route may only use the mocked email transport');
    const email = JSON.parse(String(init?.body));
    emails.push(email);
    const fails = emailFails || (confirmationFails && email.to.includes('alex@example.test'));
    return new Response(JSON.stringify(fails ? { message: 'test rejection' } : { id: 'test-email' }), { status: fails ? 503 : 200 });
  };
  const request = (body: unknown) => new NextRequest('https://crowncoastalhomes.com/api/canada-lander', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const makeLead = (city: CanadaConsultRegion, hub = false) => buildCanadaLanderPayload(canadaConsultSchemaForRegion(city).parse({
    name: 'Alex Example', email: 'alex@example.test', targetLocation: CANADA_CONSULT_REGIONS[city].areas[0], purchaseTimeline: '3–6 months', budgetRange: '$2.5–4 million', propertyPurpose: 'Second home', consent: true, phone: '', timeZone: 'America/Vancouver', message: 'A question about the coast.',
  }), { pageUrl: `https://crowncoastalhomes.com/international-buyers/canada/${hub ? 'california-homes' : city+'-consult'}?utm_source=google&private=excluded`, attribution: { utm_source: 'google', utm_campaign: 'canada-buyers', utm_content: '<script>' }, elapsedMs: 2000, company: '' }, city);
  try {
    assert.equal(CANADA_LANDER_PATHS.length, 5);
    for (const path of ['/international-buyers/canada', '/international-buyers/canada/san-diego', '/international-buyers/germany/san-diego', '/buy/san-diego']) assert.equal(isCanadaLanderPath(path), false);
    for (const city of Object.keys(CANADA_CONSULT_REGIONS) as CanadaConsultRegion[]) {
      emails.length = 0;
      const lead = makeLead(city);
      assert.equal(lead.page.includes('?'), false);
      const response = await POST(request({ ...lead, referral_possible: city === 'san-diego' }));
      assert.equal(response.status, 200);
      const delivered = await response.json();
      assert.equal(delivered.delivery, 'email');
      assert.ok(delivered.requestId);
      assert.deepEqual(emails[0].to, ADMIN_EMAILS);
      assert.equal(emails.length, 2);
      const html = String(emails[0].html);
      assert.ok(html.includes(city));
      assert.ok(html.includes(`<strong>Referral possible:</strong> ${city !== 'san-diego' ? 'Yes' : 'No'}`), 'validated city controls routing');
      assert.ok(html.includes('canada-buyers') && html.includes('&lt;script&gt;'), 'campaign values are escaped');
      assert.equal(html.includes('private=excluded'), false);
      assert.ok(String(emails[1].html).includes(CANADA_LANDER_SUCCESS));
      const tags = canadaRoutingTags(city, String(lead.budget_usd));
      assert.ok(tags.includes('canada-inbound') && tags.includes(city) && tags.includes('budget-2.5-4m-usd'));
      assert.ok(tags.every(tag => html.includes(tag)));
      assert.equal(tags.includes('referral-possible'), city !== 'san-diego');
    }
    emails.length = 0;
    const hub = await POST(request(makeLead('orange-county', true)));
    assert.equal(hub.status, 200);
    assert.equal((await hub.json()).delivery, 'email');
    assert.ok(String(emails[0].html).includes(CANADA_LANDER_PATHS[0]));
    for (const bad of [{ consent: false }, { email: 'bad' }, { city: 'los-angeles' }, { area: 'arbitrary area' }, { budget_usd: 'CAD 2M' }, { page: '/international-buyers/germany/san-diego' }]) {
      emails.length = 0;
      const result = await POST(request({ ...makeLead('san-diego'), ...bad }));
      assert.equal(result.status, 400, JSON.stringify(bad));
      assert.equal(emails.length, 0);
    }
    for (const spam of [{ company: 'bot' }, { __top: 10 }]) {
      const result = await POST(request({ ...makeLead('san-diego'), ...spam }));
      assert.equal(result.status, 202);
      assert.equal(emails.length, 0, 'honeypot must not deliver or convert');
      assert.equal((await result.json()).requestId, undefined);
    }
    confirmationFails = true;
    const missingConfirmation = await POST(request(makeLead('san-diego')));
    assert.equal(missingConfirmation.status, 200, 'delivered inbox enquiry remains successful if visitor confirmation fails');
    assert.ok((await missingConfirmation.json()).requestId);
    emailFails = true;
    emails.length = 0;
    const failedInbox = await POST(request(makeLead('san-diego')));
    assert.equal(failedInbox.status, 502);
    const rejected = await failedInbox.json();
    assert.equal(rejected.success, false);
    assert.equal(rejected.requestId, undefined);
    assert.equal(emails.length, 1, 'no visitor confirmation if inbox delivery fails');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
  }
  console.log('Canada lander: email-only route, all cities/hub, routing, escaped UTMs, consent, spam, inbox and confirmation failures passed with mocked transport');
}
void main().catch(error => { console.error(error); process.exitCode = 1; });
