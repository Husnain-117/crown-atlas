/**
 * Tests for validateLandingOutput
 * ================================
 * Unit tests for the semantic validation function.
 *
 * Run with:
 *   npx ts-node --project tsconfig.scripts.json src/ai/__tests__/landingOutputValidator.test.ts
 */

import {
  validateLandingOutput,
  extractPlaceCandidates,
  countBullets,
  checkRepetition,
} from '../validators/landingOutputValidator';
import type { LandingPageContent, InputJson } from '../landing';

// ============================================================================
// Test Helper
// ============================================================================

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`  ❌ ${name}`);
    console.log(`     Error: ${error instanceof Error ? error.message : String(error)}`);
    failed++;
  }
}

function expect(actual: unknown) {
  return {
    toBe(expected: unknown) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toBeTrue() {
      if (actual !== true) {
        throw new Error(`Expected true, got ${actual}`);
      }
    },
    toBeFalse() {
      if (actual !== false) {
        throw new Error(`Expected false, got ${actual}`);
      }
    },
    toContainErrorCode(code: string) {
      if (!Array.isArray(actual)) {
        throw new Error(`Expected array, got ${typeof actual}`);
      }
      const found = actual.some((e: { code?: string }) => e.code === code);
      if (!found) {
        throw new Error(`Expected errors to contain code "${code}". Found: ${actual.map((e: { code?: string }) => e.code).join(', ')}`);
      }
    },
    notToContainErrorCode(code: string) {
      if (!Array.isArray(actual)) {
        throw new Error(`Expected array, got ${typeof actual}`);
      }
      const found = actual.some((e: { code?: string }) => e.code === code);
      if (found) {
        throw new Error(`Expected errors NOT to contain code "${code}"`);
      }
    },
    toHaveLengthGreaterThan(len: number) {
      if (!Array.isArray(actual)) {
        throw new Error(`Expected array, got ${typeof actual}`);
      }
      if (actual.length <= len) {
        throw new Error(`Expected length > ${len}, got ${actual.length}`);
      }
    },
  };
}

// ============================================================================
// Fixtures
// ============================================================================

function createValidInput(): InputJson {
  return {
    city: 'Irvine',
    county: 'Orange County',
    canonical_path: '/california/irvine/homes-for-sale',
    data_source: 'MLS',
    last_updated_iso: '2025-01-15T10:00:00Z',
    featured_listings_has_missing_specs: true,
    region: 'California',
    internal_links: {
      related_pages: [
        { href: '/california/irvine/condos-for-sale', anchor: 'Irvine Condos For Sale' },
      ],
      more_in_city: [
        { href: '/california/irvine/luxury-homes', anchor: 'Irvine Luxury Homes' },
      ],
      nearby_cities: [
        { href: '/california/tustin/homes-for-sale', anchor: 'Tustin' },
      ],
    },
  };
}

function createValidOutput(input: InputJson): LandingPageContent {
  const currentYear = new Date().getFullYear();

  return {
    seo: {
      title: `Homes for Sale in Irvine, CA | ${currentYear}`,
      meta_description: 'Browse Irvine homes for sale.',
      h1: 'Homes for Sale in Irvine',
      canonical_path: input.canonical_path,
      og_title: 'Irvine Homes',
      og_description: 'Find homes in Irvine.',
    },
    intro: {
      subheadline: 'Find your perfect home',
      quick_bullets: ['Updated listings', 'Local expertise', 'Market data', 'Agent support'],
      last_updated_line: 'Last updated January 2025',
    },
    sections: {
      hero_overview: {
        heading: 'Homes for Sale in Irvine',
        body: 'Explore Irvine homes for sale in California.',
      },
      about_area: {
        heading: 'About Irvine',
        body: 'Irvine is a master-planned community in Orange County.',
      },
      neighborhoods: {
        heading: 'Neighborhoods',
        body: 'Irvine has diverse neighborhoods.',
        cards: [
          {
            name: 'Central Irvine',
            blurb: 'Heart of the city',
            best_for: ['Families', 'Commuters'],
            internal_link_text: 'Irvine Condos For Sale',
            internal_link_href: '/california/irvine/condos-for-sale',
          },
        ],
      },
      buyer_strategy: {
        heading: 'How to Buy',
        body: '<ul><li>Set your budget</li><li>Get pre-approved</li><li>Review comparable sales</li><li>Search listings</li><li>Review HOA documents</li><li>Schedule tours</li><li>Complete an inspection</li><li>Close escrow</li></ul>',
        cta: {
          title: 'Ready to start?',
          body: 'Contact us before touring homes or when reviewing disclosures.',
          button_text: 'Contact an agent',
          button_href: '/contact',
        },
      },
      buy_vs_rent: {
        heading: 'Buy vs. Rent',
        body: 'Compare ownership costs, flexibility, and long-term plans before deciding.',
      },
      property_types: {
        heading: 'Property Types',
        body: 'Irvine offers condos, townhomes, and single-family homes.',
      },
      market_snapshot: {
        heading: 'Market Snapshot',
        body: `Current market data. Data source: ${input.data_source}. Last updated: ${input.last_updated_iso}.`,
      },
      price_breakdown: {
        heading: 'Price Breakdown',
        body: '<table><tbody><tr><th>Median price</th><td>$1,250,000</td></tr><tr><th>HOA range</th><td>$0-$600</td></tr><tr><th>Price per sqft</th><td>$700 per sqft</td></tr><tr><th>Days on market</th><td>24 days</td></tr></tbody></table>',
      },
      schools_education: {
        heading: 'Schools',
        body: 'Irvine has excellent schools. Verify boundaries.',
      },
      lifestyle_amenities: {
        heading: 'Lifestyle',
        body: 'Outdoor recreation and shopping in Irvine.',
      },
      featured_listings: {
        heading: 'Featured Listings',
        body: 'Some featured listings may not show every detail (such as square footage or bed/bath count) in the quick view; open the full listing page for complete information before making decisions.',
      },
      working_with_agent: {
        heading: 'Work With Us',
        body: 'Crown Coastal Homes can help. Agent: Reza Barghlameno (DRE 02211952).',
      },
    },
    faq: [
      { q: 'How competitive is the market?', a: 'The market is competitive with active inventory.' },
      { q: 'What is the price range?', a: 'Prices vary by neighborhood.' },
      { q: 'How long do homes stay?', a: 'Average days on market varies.' },
      { q: 'Need pre-approval?', a: 'Yes, pre-approval is recommended.' },
      { q: 'HOA costs?', a: 'HOA fees depend on the property.' },
      { q: 'Best time to buy?', a: 'Spring and fall are popular.' },
      { q: 'Closing costs?', a: 'Budget for closing costs.' },
      { q: 'Agent benefits?', a: 'Agents provide local expertise.' },
      { q: 'Should I review HOA documents?', a: 'Yes, review fees, reserves, and rules.' },
      { q: 'Is an inspection important?', a: 'An inspection can identify material issues.' },
    ],
    internal_linking: {
      in_body_links: [
        { href: '/california/irvine/condos-for-sale', anchor: 'Irvine Condos For Sale', context_note: 'Related condos' },
      ],
      related_pages: [{ href: '/california/irvine/condos-for-sale', anchor: 'Irvine Condos For Sale' }],
      more_in_city: [{ href: '/california/irvine/luxury-homes', anchor: 'Irvine Luxury Homes' }],
      nearby_cities: [{ href: '/california/tustin/homes-for-sale', anchor: 'Tustin' }],
    },
    trust: {
      about_brand: 'Crown Coastal Homes is a trusted platform.',
      agent_box: {
        headline: 'Work with a local expert',
        body: 'Contact Reza Barghlameno.',
        disclaimer: 'General info only. Verify details with official sources and the listing broker.',
      },
    },
  };
}

// ============================================================================
// Tests: extractPlaceCandidates
// ============================================================================

console.log('\n📋 Testing extractPlaceCandidates\n');

test('should extract capitalized place names', () => {
  const text = 'Explore homes in La Jolla and Pacific Beach near San Diego.';
  const candidates = extractPlaceCandidates(text);

  expect(candidates).toHaveLengthGreaterThan(0);
});

test('should skip common headings', () => {
  const text = 'Homes for Sale in Irvine. Market Snapshot shows prices.';
  const candidates = extractPlaceCandidates(text);

  // Should find Irvine but not "Homes for Sale" or "Market Snapshot"
  const found = candidates.some((candidate) => candidate.toLowerCase() === 'irvine');
  expect(found).toBeTrue();
});

// ============================================================================
// Tests: countBullets
// ============================================================================

console.log('\n📋 Testing countBullets\n');

test('should count hyphen bullets correctly', () => {
  const text = '- Item 1\\n- Item 2\\n- Item 3';
  expect(countBullets(text)).toBe(3);
});

test('should handle escaped newlines', () => {
  const text = 'Steps:\\n- Step 1\\n- Step 2\\n- Step 3\\n- Step 4\\n- Step 5\\n- Step 6\\n- Step 7\\n- Step 8';
  expect(countBullets(text)).toBe(8);
});

test('should return 0 for no bullets', () => {
  const text = 'No bullets here. Just plain text.';
  expect(countBullets(text)).toBe(0);
});

// ============================================================================
// Tests: checkRepetition
// ============================================================================

console.log('\n📋 Testing checkRepetition\n');

test('should detect repeated sentences', () => {
  const texts = [
    'This is a test sentence.',
    'This is a test sentence.',
    'This is a test sentence.',
    'Another sentence here.',
  ];
  const result = checkRepetition(texts);
  expect(result.count > 0).toBeTrue();
});

test('should not flag unique content', () => {
  const texts = [
    'First unique sentence here.',
    'Second different sentence.',
    'Third completely different text.',
  ];
  const result = checkRepetition(texts);
  expect(result.count).toBe(0);
});

// ============================================================================
// Tests: validateLandingOutput - GEO Validation
// ============================================================================

console.log('\n📋 Testing validateLandingOutput - GEO Validation\n');

test('should pass with valid place names', () => {
  const input = createValidInput();
  const output = createValidOutput(input);

  const result = validateLandingOutput(output, input);
  expect(result.errors).notToContainErrorCode('GEO_INVALID');
});

test('should fail with forbidden place names', () => {
  const input = createValidInput();
  const output = createValidOutput(input);

  // Add forbidden place name (La Jolla is not in Irvine's allowlist)
  output.sections.about_area.body = 'Explore La Jolla beaches and Pacific Beach.';

  const result = validateLandingOutput(output, input);
  expect(result.errors).toContainErrorCode('GEO_INVALID');
});

// ============================================================================
// Tests: validateLandingOutput - Required Phrases
// ============================================================================

console.log('\n📋 Testing validateLandingOutput - Required Phrases\n');

test('should pass with Data source and Last updated', () => {
  const input = createValidInput();
  const output = createValidOutput(input);

  const result = validateLandingOutput(output, input);
  expect(result.errors).notToContainErrorCode('MISSING_DATA_SOURCE');
  expect(result.errors).notToContainErrorCode('MISSING_LAST_UPDATED');
});

test('should fail without Data source', () => {
  const input = createValidInput();
  const output = createValidOutput(input);

  output.sections.market_snapshot.body = 'Market data here. Last updated: 2025-01-15T10:00:00Z.';

  const result = validateLandingOutput(output, input);
  expect(result.errors).toContainErrorCode('MISSING_DATA_SOURCE');
});

test('should fail without Last updated', () => {
  const input = createValidInput();
  const output = createValidOutput(input);

  output.sections.market_snapshot.body = 'Market data here. Data source: Cloud SQL.';

  const result = validateLandingOutput(output, input);
  expect(result.errors).toContainErrorCode('MISSING_LAST_UPDATED');
});

test('should fail without missing-specs sentence when flag is true', () => {
  const input = createValidInput();
  input.featured_listings_has_missing_specs = true;

  const output = createValidOutput(input);
  output.sections.featured_listings.body = 'Check out these listings.';

  const result = validateLandingOutput(output, input);
  expect(result.errors).toContainErrorCode('MISSING_SPECS_SENTENCE');
});

test('should fail with duplicate missing-specs sentence', () => {
  const input = createValidInput();
  input.featured_listings_has_missing_specs = true;

  const output = createValidOutput(input);
  const sentence = 'Some featured listings may not show every detail (such as square footage or bed/bath count) in the quick view; open the full listing page for complete information before making decisions.';
  output.sections.featured_listings.body = `${sentence} ${sentence}`;

  const result = validateLandingOutput(output, input);
  expect(result.errors).toContainErrorCode('MISSING_SPECS_SENTENCE_DUPLICATE');
});

// ============================================================================
// Tests: validateLandingOutput - Bullet Count
// ============================================================================

console.log('\n📋 Testing validateLandingOutput - Bullet Count\n');

test('should fail with too few bullets', () => {
  const input = createValidInput();
  const output = createValidOutput(input);

  output.sections.buyer_strategy.body = '<ul><li>Inspection</li><li>HOA documents</li><li>Comparable sales</li></ul>';

  const result = validateLandingOutput(output, input);
  expect(result.errors).toContainErrorCode('INSUFFICIENT_BULLETS');
});

test('should fail with too many bullets', () => {
  const input = createValidInput();
  const output = createValidOutput(input);

  const bullets = Array(13).fill('<li>Review inspection, HOA documents, and comparable sales</li>').join('');
  output.sections.buyer_strategy.body = `<ul>${bullets}</ul>`;

  const result = validateLandingOutput(output, input);
  expect(result.errors).toContainErrorCode('TOO_MANY_BULLETS');
});

// ============================================================================
// Tests: validateLandingOutput - Internal Links
// ============================================================================

console.log('\n📋 Testing validateLandingOutput - Internal Links\n');

test('should fail when internal_linking arrays do not match input', () => {
  const input = createValidInput();
  const output = createValidOutput(input);

  // Mismatch the arrays
  output.internal_linking.related_pages = [
    { href: '/wrong/path', anchor: 'Wrong Anchor' },
  ];

  const result = validateLandingOutput(output, input);
  expect(result.errors).toContainErrorCode('INTERNAL_LINKS_MISMATCH');
});

test('should fail with invalid in_body_link', () => {
  const input = createValidInput();
  const output = createValidOutput(input);

  output.internal_linking.in_body_links = [
    { href: '/invalid/link', anchor: 'Invalid Link', context_note: 'test' },
  ];

  const result = validateLandingOutput(output, input);
  expect(result.errors).toContainErrorCode('INVALID_IN_BODY_LINK');
});

// ============================================================================
// Tests: validateLandingOutput - Forbidden Content
// ============================================================================

console.log('\n📋 Testing validateLandingOutput - Forbidden Content\n');

test('should fail with AI mention in content', () => {
  const input = createValidInput();
  const output = createValidOutput(input);

  output.sections.about_area.body = 'This content was generated by AI technology.';

  const result = validateLandingOutput(output, input);
  expect(result.errors).toContainErrorCode('FORBIDDEN_TOKEN');
});

test('should fail with Cloud SQL mention', () => {
  const input = createValidInput();
  const output = createValidOutput(input);

  output.sections.about_area.body = 'Data comes from Cloud SQL database.';

  const result = validateLandingOutput(output, input);
  expect(result.errors).toContainErrorCode('FORBIDDEN_TOKEN');
});

// ============================================================================
// Tests: validateLandingOutput - Structural Checks
// ============================================================================

console.log('\n📋 Testing validateLandingOutput - Structural Checks\n');

test('should fail with empty neighborhood cards', () => {
  const input = createValidInput();
  const output = createValidOutput(input);

  output.sections.neighborhoods.cards = [];

  const result = validateLandingOutput(output, input);
  expect(result.errors).toContainErrorCode('EMPTY_NEIGHBORHOOD_CARDS');
});

test('should fail with wrong CTA button', () => {
  const input = createValidInput();
  const output = createValidOutput(input);

  output.sections.buyer_strategy.cta.button_text = 'Call Now';

  const result = validateLandingOutput(output, input);
  expect(result.errors).toContainErrorCode('INVALID_CTA_BUTTON_TEXT');
});

test('should fail with canonical_path mismatch', () => {
  const input = createValidInput();
  const output = createValidOutput(input);

  output.seo.canonical_path = '/wrong/path';

  const result = validateLandingOutput(output, input);
  expect(result.errors).toContainErrorCode('CANONICAL_MISMATCH');
});

// ============================================================================
// Tests: Full validation pass
// ============================================================================

console.log('\n📋 Testing validateLandingOutput - Full Pass\n');

test('should pass full validation with valid content', () => {
  const input = createValidInput();
  const output = createValidOutput(input);

  const result = validateLandingOutput(output, input);

  if (!result.ok) {
    console.log('    Unexpected errors:', result.errors.map(e => e.code).join(', '));
  }

  expect(result.ok).toBeTrue();
});

// ============================================================================
// Summary
// ============================================================================

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  Tests: ${passed + failed} total, ${passed} passed, ${failed} failed`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (failed > 0) {
  process.exit(1);
}
