import { z } from 'zod';
import type { CanadaConsultRegion } from './canada-consult-regions';
import { buildCanadaConsultPayload, canadaConsultSchemaForRegion, type CampaignAttribution } from './canada-consult-inquiry';

import { CANADA_LANDER_PATHS, isCanadaLanderPath } from './canada-lander-content';

const citySchema = z.enum(['san-diego', 'los-angeles', 'orange-county', 'santa-barbara']);
export const canadaLanderSchema = z.object({
  source: z.literal('canada-lander'),
  page: z.string().refine(isCanadaLanderPath, 'Please check the enquiry page.'),
  city: citySchema,
  area: z.string(), timeline: z.string(), budget_usd: z.string(), purpose: z.string(),
  name: z.string(), email: z.string(), phone: z.string().default(''),
  timezone: z.string(), message: z.string().max(1000).default(''), consent: z.literal(true),
  referral_possible: z.boolean().optional(),
  utm_source: z.string().trim().max(200).default(''),
  utm_campaign: z.string().trim().max(200).default(''),
  utm_content: z.string().trim().max(200).default(''),
}).superRefine((lead, ctx) => {
  if (lead.page !== CANADA_LANDER_PATHS[0] && lead.page !== `/international-buyers/canada/${lead.city}-consult`) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['city'], message: 'Please check the enquiry city.' });
  }
  const validated = canadaConsultSchemaForRegion(lead.city).safeParse(canadaLanderValues(lead));
  if (!validated.success) validated.error.issues.forEach(issue => ctx.addIssue(issue));
});

export function canadaLanderValues(lead: {
  name: string; email: string; area: string; timeline: string; budget_usd: string;
  purpose: string; phone: string; timezone: string; message: string; consent: boolean;
}) {
  return { name: lead.name, email: lead.email, targetLocation: lead.area, purchaseTimeline: lead.timeline, budgetRange: lead.budget_usd, propertyPurpose: lead.purpose, phone: lead.phone, timeZone: lead.timezone, message: lead.message, consent: lead.consent };
}

export function buildCanadaLanderPayload(values: Parameters<typeof buildCanadaConsultPayload>[0], context: { pageUrl: string; elapsedMs: number; company: string; attribution: CampaignAttribution }, city: CanadaConsultRegion) {
  const v = canadaConsultSchemaForRegion(city).parse(values);
  return {
    source: 'canada-lander' as const, page: new URL(context.pageUrl).pathname,
    city, area: v.targetLocation, timeline: v.purchaseTimeline, budget_usd: v.budgetRange,
    purpose: v.propertyPurpose, name: v.name, email: v.email, phone: v.phone || '',
    timezone: v.timeZone, message: v.message || '', consent: v.consent,
    referral_possible: city !== 'san-diego',
    utm_source: context.attribution.utm_source || '', utm_campaign: context.attribution.utm_campaign || '', utm_content: context.attribution.utm_content || '',
    company: context.company.slice(0, 200), __top: Math.max(0, Number.isFinite(context.elapsedMs) ? context.elapsedMs : 0),
  };
}

export function canadaRoutingTags(city: CanadaConsultRegion, budget: string) {
  const bands: Record<string, string> = { '$1.5–2.5 million': 'budget-1.5-2.5m-usd', '$2.5–4 million': 'budget-2.5-4m-usd', '$4 million or more': 'budget-4m-plus-usd', 'Prefer to discuss': 'budget-discuss' };
  return ['canada-inbound', city, bands[budget] || 'budget-discuss', ...(city !== 'san-diego' ? ['referral-possible'] : [])];
}
