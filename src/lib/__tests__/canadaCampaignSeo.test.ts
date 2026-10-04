import assert from 'node:assert/strict';
import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { CANADA_CAMPAIGN_PATHS, CANADA_GENERAL_FAQS, CANADA_LIFESTYLE_IMAGE, CANADA_REGIONAL_PLANNING, buildCanadaCampaignSchema, canadaCampaignMetadata, canadaConsultFaqs } from '../canada-campaign-seo';
import { CANADA_CONSULT_REGIONS, type CanadaConsultRegion } from '../canada-consult-regions';
import { SITE_SCHEMA_IDS } from '../seo/site-schema';
import { SITE_URL } from '../constants/site';
import sitemap from '../../app/sitemap';

const regions: (CanadaConsultRegion | undefined)[] = [undefined, ...Object.keys(CANADA_CONSULT_REGIONS) as CanadaConsultRegion[]];
assert.equal(CANADA_CAMPAIGN_PATHS.length, 5);
assert.equal(new Set(CANADA_CAMPAIGN_PATHS).size, 5);
for (const region of regions) {
  const path = region ? `/international-buyers/canada/${region}-consult` : '/international-buyers/canada/california-homes';
  const production = canadaCampaignMetadata(region, { VERCEL: '1', VERCEL_ENV: 'production' });
  assert.deepEqual(production.alternates, { canonical: path });
  for (const [env, index] of [[{ VERCEL: '1', VERCEL_ENV: 'production' }, true], [{ VERCEL: '1', VERCEL_ENV: 'preview' }, false], [{ VERCEL: '1' }, false], [{}, true]] as const) {
    const robots = canadaCampaignMetadata(region, env).robots;
    assert.ok(robots && typeof robots !== 'string');
    assert.equal(robots.index, index, `${path}: production indexing must not expose previews`);
    assert.equal(robots.follow, index);
  }
  assert.equal(production.openGraph?.url, SITE_URL + path);
  const graph = buildCanadaCampaignSchema(region)['@graph'];
  const page = graph.find(node => node['@id'] === `${SITE_URL}${path}#webpage`)!;
  assert.equal(page.url, SITE_URL + path);
  assert.deepEqual(page.publisher, { '@id': SITE_SCHEMA_IDS.organization });
  assert.deepEqual(graph.find(node => node['@type'] === 'Service')?.provider, { '@id': SITE_SCHEMA_IDS.localBusiness });
  const expectedFaqs = region ? canadaConsultFaqs(region) : CANADA_GENERAL_FAQS;
  assert.deepEqual(page.mainEntity, expectedFaqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })), 'schema uses the same FAQ data as visible answers');
  const json = JSON.stringify(graph);
  assert.doesNotMatch(json, /aggregateRating|datePublished|streetAddress|reviewRating/, 'campaigns do not invent ratings, publication dates or regional offices');
  if (region) {
    assert.match(CANADA_REGIONAL_PLANNING[region].listingPath, /^\/buy\/[a-z-]+$/);
    assert.ok(expectedFaqs.some(faq => faq.answer.includes('based in San Diego')));
  }
}
assert.equal(new Set(regions.map(region => canadaCampaignMetadata(region).title)).size, 5);
assert.equal(new Set(Object.values(CANADA_REGIONAL_PLANNING).map(item => item.answer)).size, 4, 'each regional page has its own search guidance');
assert.ok(statSync(resolve(process.cwd(), 'public' + CANADA_LIFESTYLE_IMAGE)).size < 300_000);
const mobilePhotos = ['clients-kaushal', 'clients-jacobo', 'laguna-beach-coast'];
assert.ok(mobilePhotos.reduce((bytes, name) => bytes + statSync(resolve(process.cwd(), `public/images/canada/${name}-mobile.webp`)).size, 0) < 140_000, 'the whole mobile collage stays small');
async function checkSitemap() {
  const databaseUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    const entries = await sitemap();
    for (const path of CANADA_CAMPAIGN_PATHS) {
      assert.equal(entries.filter(entry => entry.url === SITE_URL + path).length, 1, 'each public campaign has one canonical sitemap entry');
    }
    assert.ok(entries.some(entry => entry.url === SITE_URL + '/international-buyers/canada'), 'the country guide remains discoverable');
  } finally {
    if (databaseUrl !== undefined) process.env.DATABASE_URL = databaseUrl;
  }
  console.log('Canada campaign SEO: indexing, preview protection, canonical/schema identity, FAQ parity, sitemap coverage and image budgets passed');
}
void checkSitemap().catch(error => { console.error(error); process.exitCode = 1; });
