/**
 * ============================================================
 * DIAGNOSTIC SCRIPT: Pacific Heights / San Francisco DB Audit
 * ============================================================
 * 
 * Usage:   node scripts/diagnose-pacific-heights.js
 * Requires: DATABASE_URL in your .env or environment
 *
 * This script checks:
 *  1.  DB connectivity & active listing freshness
 *  2.  SF-wide active listing counts (all statuses breakdown)
 *  3.  Pacific Heights: how the site currently queries it (subdivision_name)
 *  4.  Pacific Heights: raw ZIP-code-based query (the Zillow way)
 *  5.  All Pacific Heights ZIPs (94115, 94118, 94123) — raw counts
 *  6.  What subdivision_names exist in Pacific Heights ZIPs
 *  7.  Property type breakdown for SF active listings
 *  8.  last_seen_ts / updated_at freshness check (are we pulling active vs stale?)
 *  9.  Sample listings from Pacific Heights ZIPs
 * 10.  Recommendations summary
 * ============================================================
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { Pool } = require('pg');

// ── Connection ─────────────────────────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('\n❌  ERROR: DATABASE_URL is not set in your environment.');
  console.error('   Set it in .env.local or export it before running this script.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1')
    ? false
    : { rejectUnauthorized: false },
  max: 5,
  connectionTimeoutMillis: 15000,
});

// Pacific Heights is physically in these San Francisco ZIP codes.
// 94115  = core Pacific Heights
// 94118  = upper Pacific Heights / Presidio Heights overlap  
// 94123  = Marina District (borders Pacific Heights)
// Zillow draws a broader boundary, so we also include these:
const PACIFIC_HEIGHTS_ZIPS = ['94115', '94118', '94123'];

// ── Helpers ────────────────────────────────────────────────────────────────────
const sep  = () => console.log('\n' + '─'.repeat(70));
const head = (msg) => { sep(); console.log(`▶  ${msg}`); sep(); };
const row  = (label, value) => console.log(`   ${(label + ':').padEnd(42)} ${value}`);
const ok   = (msg) => console.log(`   ✅  ${msg}`);
const warn = (msg) => console.log(`   ⚠️   ${msg}`);
const err  = (msg) => console.log(`   ❌  ${msg}`);

async function run() {
  console.log('\n🔍  PACIFIC HEIGHTS / SAN FRANCISCO DATABASE DIAGNOSTIC');
  console.log('    Running against:', DATABASE_URL.replace(/:\/\/.*@/, '://***@'));
  console.log('    Time (UTC):', new Date().toISOString());

  // ── 1. Connectivity ─────────────────────────────────────────────────────────
  head('1. DATABASE CONNECTIVITY');
  try {
    const r = await pool.query('SELECT NOW() AS ts, version() AS pg_ver');
    ok(`Connected  —  DB time: ${r.rows[0].ts}`);
    console.log(`   Server:  ${r.rows[0].pg_ver.split(' ').slice(0, 2).join(' ')}`);
  } catch (e) {
    err(`Cannot connect: ${e.message}`);
    process.exit(1);
  }

  // ── 2. DB freshness: when was the last sync? ─────────────────────────────────
  head('2. LISTING FRESHNESS — When was the DB last updated?');
  try {
    const r = await pool.query(`
      SELECT
        MAX(updated_at)::text       AS last_updated,
        MAX(last_seen_ts)::text     AS last_seen,
        COUNT(*)::int               AS total_rows,
        COUNT(*) FILTER (WHERE standard_status = 'Active')::int AS active_rows,
        COUNT(*) FILTER (WHERE standard_status = 'Active'
          AND updated_at >= NOW() - INTERVAL '24 hours')::int   AS active_updated_24h,
        COUNT(*) FILTER (WHERE standard_status = 'Active'
          AND updated_at >= NOW() - INTERVAL '7 days')::int     AS active_updated_7d
      FROM properties;
    `);
    const d = r.rows[0];
    row('Total properties in DB',        d.total_rows.toLocaleString());
    row('Active listings (all cities)',   d.active_rows.toLocaleString());
    row('Last updated_at timestamp',      d.last_updated || 'NULL');
    row('Last last_seen_ts timestamp',    d.last_seen    || 'NULL — column may not exist');
    row('Active updated in last 24 h',   d.active_updated_24h.toLocaleString());
    row('Active updated in last 7 days', d.active_updated_7d.toLocaleString());

    const hrs = d.last_updated
      ? Math.round((Date.now() - new Date(d.last_updated)) / 3_600_000)
      : 999;
    if (hrs < 2)  ok(`Data is fresh — last sync was ${hrs}h ago`);
    else if (hrs < 25) warn(`Data is ~${hrs}h old — consider re-syncing`);
    else          err(`Data is STALE — last sync was ${hrs}h ago! Active listings may be wrong.`);
  } catch (e) {
    err(`Query failed: ${e.message}`);
  }

  // ── 3. SF city-wide summary ──────────────────────────────────────────────────
  head('3. SAN FRANCISCO CITY-WIDE ACTIVE LISTINGS');
  try {
    const r = await pool.query(`
      SELECT
        standard_status,
        property_type,
        COUNT(*)::int AS cnt
      FROM properties
      WHERE LOWER(city) = 'san francisco'
        AND LOWER(state_or_province) = 'ca'
      GROUP BY standard_status, property_type
      ORDER BY standard_status, cnt DESC;
    `);
    if (r.rowCount === 0) {
      err('No rows found for city = "San Francisco" — city name may differ in DB!');
    } else {
      console.log('\n   status           | property_type               | count');
      console.log('   ' + '-'.repeat(60));
      r.rows.forEach(row => {
        console.log(`   ${(row.standard_status||'').padEnd(16)} | ${(row.property_type||'').padEnd(27)} | ${row.cnt}`);
      });
    }
  } catch (e) {
    err(`Query failed: ${e.message}`);
  }

  // ── 4. How the site currently queries Pacific Heights ────────────────────────
  head('4. HOW THE SITE CURRENTLY QUERIES — subdivision_name LIKE "%Pacific Heights%"');
  try {
    const r = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE standard_status = 'Active')::int AS active,
        COUNT(*) FILTER (WHERE standard_status = 'Active'
          AND property_type NOT IN ('Land','ResidentialLease','CommercialLease','CommercialSale','BusinessOpportunity'))::int AS active_residential
      FROM properties
      WHERE LOWER(city) = 'san francisco'
        AND LOWER(state_or_province) = 'ca'
        AND LOWER(subdivision_name) LIKE '%pacific heights%';
    `);
    const d = r.rows[0];
    row('Total listings with subdivision_name match',  d.total);
    row('Active listings',                              d.active);
    row('Active residential (site query result)',       d.active_residential);

    if (d.active_residential <= 2) {
      err('This is why you see so few listings! subdivision_name is barely populated for SF neighborhoods.');
    } else {
      warn('subdivision_name gives ' + d.active_residential + ' listings — may still be incomplete vs Zillow.');
    }
  } catch (e) {
    err(`Query failed: ${e.message}`);
  }

  // ── 5. ZIP-code-based query (the Zillow way) ─────────────────────────────────
  head(`5. ZIP-CODE QUERY — postal_code IN (${PACIFIC_HEIGHTS_ZIPS.join(', ')})`);
  try {
    const r = await pool.query(`
      SELECT
        split_part(postal_code, '-', 1) AS zip,
        standard_status,
        COUNT(*)::int AS cnt,
        COUNT(*) FILTER (WHERE property_type NOT IN ('Land','ResidentialLease','CommercialLease','CommercialSale','BusinessOpportunity'))::int AS residential_cnt
      FROM properties
      WHERE split_part(postal_code, '-', 1) = ANY($1)
        AND LOWER(state_or_province) = 'ca'
      GROUP BY zip, standard_status
      ORDER BY zip, standard_status;
    `, [PACIFIC_HEIGHTS_ZIPS]);

    if (r.rowCount === 0) {
      err('No properties found for Pacific Heights ZIPs — these ZIPs are missing from the DB!');
      warn('This is a DATA COVERAGE issue: CRMLS may not index SF listings. SF uses SFAR/BAREIS MLS.');
    } else {
      console.log('\n   zip    | status           | total | residential');
      console.log('   ' + '-'.repeat(50));
      r.rows.forEach(row => {
        console.log(`   ${(row.zip||'none').padEnd(6)} | ${(row.standard_status||'').padEnd(16)} | ${String(row.cnt).padEnd(5)} | ${row.residential_cnt}`);
      });
    }

    // Total active residential via ZIP
    const tot = await pool.query(`
      SELECT COUNT(*)::int AS cnt
      FROM properties
      WHERE split_part(postal_code, '-', 1) = ANY($1)
        AND LOWER(state_or_province) = 'ca'
        AND standard_status = 'Active'
        AND property_type NOT IN ('Land','ResidentialLease','CommercialLease','CommercialSale','BusinessOpportunity');
    `, [PACIFIC_HEIGHTS_ZIPS]);
    const total = tot.rows[0].cnt;
    console.log(`\n   → TOTAL Active Residential via ZIPs: ${total}  (Zillow shows 43)`);
    if (total < 10) {
      err(`Only ${total} active residential listings via ZIPs — severe under-coverage!`);
    } else {
      ok(`ZIP-based count: ${total} — closer to Zillow's 43`);
    }
  } catch (e) {
    err(`Query failed: ${e.message}`);
  }

  // ── 6. What subdivision_names exist in Pacific Heights ZIPs? ─────────────────
  head('6. SUBDIVISION NAMES IN PACIFIC HEIGHTS ZIP CODES (active listings)');
  try {
    const r = await pool.query(`
      SELECT
        subdivision_name,
        COUNT(*)::int AS cnt
      FROM properties
      WHERE split_part(postal_code, '-', 1) = ANY($1)
        AND LOWER(state_or_province) = 'ca'
        AND standard_status = 'Active'
      GROUP BY subdivision_name
      ORDER BY cnt DESC
      LIMIT 30;
    `, [PACIFIC_HEIGHTS_ZIPS]);

    if (r.rowCount === 0) {
      err('No active listings in Pacific Heights ZIPs to show subdivision names from.');
    } else {
      console.log('\n   subdivision_name                         | count');
      console.log('   ' + '-'.repeat(50));
      r.rows.forEach(row => {
        console.log(`   ${(row.subdivision_name || 'NULL').padEnd(40)} | ${row.cnt}`);
      });
    }
  } catch (e) {
    err(`Query failed: ${e.message}`);
  }

  // ── 7. MLS/provider breakdown for SF active listings ─────────────────────────
  head('7. MLS SOURCE / PROVIDER BREAKDOWN — SF Active Listings');
  try {
    // Check if list_office_mls_id or originating_system_name columns exist
    const cols = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'properties'
        AND column_name IN ('originating_system_name','list_office_mls_id','mls_status','source_system_key')
      ORDER BY column_name;
    `);
    const existingCols = cols.rows.map(r => r.column_name);
    console.log(`\n   Available MLS-related columns: ${existingCols.join(', ') || 'none found'}`);

    if (existingCols.includes('originating_system_name')) {
      const r = await pool.query(`
        SELECT originating_system_name, COUNT(*)::int AS cnt
        FROM properties
        WHERE LOWER(city) = 'san francisco' AND standard_status = 'Active'
        GROUP BY originating_system_name
        ORDER BY cnt DESC;
      `);
      console.log('\n   MLS Source                | SF Active Listings');
      console.log('   ' + '-'.repeat(45));
      r.rows.forEach(row => {
        console.log(`   ${(row.originating_system_name || 'NULL').padEnd(25)} | ${row.cnt}`);
      });
    } else {
      warn('originating_system_name column not found — check list_agent_mls_id or listing_key prefix for MLS origin');
      // Infer MLS from listing_key prefix
      const r2 = await pool.query(`
        SELECT
          LEFT(listing_key, 3) AS key_prefix,
          COUNT(*)::int AS cnt
        FROM properties
        WHERE LOWER(city) = 'san francisco' AND standard_status = 'Active'
        GROUP BY key_prefix
        ORDER BY cnt DESC
        LIMIT 20;
      `);
      console.log('\n   listing_key prefix (MLS hint) | SF Active Count');
      console.log('   ' + '-'.repeat(45));
      r2.rows.forEach(row => {
        console.log(`   ${(row.key_prefix || 'NULL').padEnd(30)} | ${row.cnt}`);
      });
    }
  } catch (e) {
    err(`Query failed: ${e.message}`);
  }

  // ── 8. Sample Pacific Heights listings ───────────────────────────────────────
  head('8. SAMPLE ACTIVE LISTINGS IN PACIFIC HEIGHTS ZIPs');
  try {
    const r = await pool.query(`
      SELECT
        listing_key,
        list_price,
        unparsed_address,
        city,
        postal_code,
        subdivision_name,
        property_type,
        bedrooms_total,
        bathrooms_total_integer,
        standard_status,
        updated_at::text AS updated_at
      FROM properties
      WHERE split_part(postal_code, '-', 1) = ANY($1)
        AND LOWER(state_or_province) = 'ca'
        AND standard_status = 'Active'
        AND property_type NOT IN ('Land','ResidentialLease','CommercialLease','CommercialSale','BusinessOpportunity')
      ORDER BY updated_at DESC
      LIMIT 10;
    `, [PACIFIC_HEIGHTS_ZIPS]);

    if (r.rowCount === 0) {
      err('No active residential listings found in Pacific Heights ZIPs');
    } else {
      r.rows.forEach((p, i) => {
        console.log(`\n   [${i+1}] ${p.unparsed_address || 'No address'}`);
        console.log(`       Price: $${(p.list_price||0).toLocaleString()}  |  Beds: ${p.bedrooms_total}  |  Baths: ${p.bathrooms_total_integer}`);
        console.log(`       ZIP: ${p.postal_code}  |  Type: ${p.property_type}`);
        console.log(`       Subdivision: ${p.subdivision_name || 'NULL'}`);
        console.log(`       Listing Key: ${p.listing_key}  |  Updated: ${p.updated_at}`);
      });
    }
  } catch (e) {
    err(`Query failed: ${e.message}`);
  }

  // ── 9. Stale status check: are any "Active" really off-market? ──────────────
  head('9. STALE LISTING CHECK — Active but not updated recently?');
  try {
    const r = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE updated_at >= NOW() - INTERVAL '1 day')::int  AS updated_1d,
        COUNT(*) FILTER (WHERE updated_at >= NOW() - INTERVAL '7 days')::int  AS updated_7d,
        COUNT(*) FILTER (WHERE updated_at >= NOW() - INTERVAL '30 days')::int AS updated_30d,
        COUNT(*) FILTER (WHERE updated_at < NOW() - INTERVAL '30 days')::int  AS stale_30d_plus,
        COUNT(*) FILTER (WHERE updated_at < NOW() - INTERVAL '60 days')::int  AS stale_60d_plus
      FROM properties
      WHERE standard_status = 'Active';
    `);
    const d = r.rows[0];
    row('Active updated in last 1 day',   d.updated_1d);
    row('Active updated in last 7 days',  d.updated_7d);
    row('Active updated in last 30 days', d.updated_30d);
    row('Active NOT updated >30 days (stale?)', d.stale_30d_plus);
    row('Active NOT updated >60 days (very stale?)', d.stale_60d_plus);

    if (d.stale_30d_plus > 0) {
      warn(`${d.stale_30d_plus} listings marked Active haven't been touched in 30+ days — may be stale/expired listings still in DB`);
    } else {
      ok('Active listings all have recent sync timestamps');
    }
  } catch (e) {
    err(`Query failed: ${e.message}`);
  }

  // ── 10. Checking property_type values in DB ───────────────────────────────────
  head('10. PROPERTY TYPE VALUES in Pacific Heights ZIPs');
  try {
    const r = await pool.query(`
      SELECT property_type, property_sub_type, COUNT(*)::int as cnt
      FROM properties
      WHERE split_part(postal_code, '-', 1) = ANY($1)
        AND standard_status = 'Active'
      GROUP BY property_type, property_sub_type
      ORDER BY cnt DESC;
    `, [PACIFIC_HEIGHTS_ZIPS]);

    if (r.rowCount === 0) {
      warn('No active listings in Pacific Heights ZIPs to analyze property types');
    } else {
      console.log('\n   property_type                | property_sub_type              | count');
      console.log('   ' + '-'.repeat(70));
      r.rows.forEach(row => {
        console.log(`   ${(row.property_type||'NULL').padEnd(28)} | ${(row.property_sub_type||'NULL').padEnd(30)} | ${row.cnt}`);
      });
    }
  } catch (e) {
    err(`Query failed: ${e.message}`);
  }

  // ── SUMMARY & RECOMMENDATIONS ─────────────────────────────────────────────────
  sep();
  console.log('\n📋  SUMMARY & ROOT CAUSE ANALYSIS\n');

  console.log(`  The core issue is likely ONE or more of:\n`);
  console.log(`  A) DATA COVERAGE — CRMLS (your provider) has limited SF coverage.`);
  console.log(`     Pacific Heights listings are predominantly on SFAR (San Francisco`);
  console.log(`     Association of Realtors) and BAREIS MLS, which Zillow aggregates.`);
  console.log(`     Trestle/CRMLS may not feed SFAR data → only 1 listing synced.\n`);
  console.log(`  B) QUERY METHOD — Site uses subdivision_name LIKE '%Pacific Heights%'`);
  console.log(`     (because Pacific Heights has no zipCodes in counties.ts).`);
  console.log(`     Most SF listings store city='San Francisco' but leave subdivision_name`);
  console.log(`     blank or use a different neighborhood label.\n`);
  console.log(`  C) STALE DB — If the sync hasn't run recently, even valid Active`);
  console.log(`     listings may not be reflected in the DB yet.\n`);

  console.log(`  HOW TO FIX:\n`);
  console.log(`  1. ✅ ADD ZIP CODES to Pacific Heights in src/lib/counties.ts:`);
  console.log(`         { name: "Pacific Heights", slug: "pacific-heights",`);
  console.log(`           displayName: "Pacific Heights, SF",`);
  console.log(`           zipCodes: ["94115", "94118"] }`);
  console.log(`     This makes getCityMetrics() use ZIP-based queries instead of`);
  console.log(`     subdivision_name, which will return all SF listings in those ZIPs.\n`);
  console.log(`  2. 🔍 CHECK TRESTLE/CRMLS COVERAGE for SF (SFAR MLS feeds):`);
  console.log(`     Log into Trestle dashboard and check if SFAR feed is enabled.`);
  console.log(`     Without SFAR, Pacific Heights will always show <5 listings.\n`);
  console.log(`  3. 🔄 RE-RUN SYNC if the DB is stale (see Section 2 above).\n`);

  sep();
  console.log('\n✅  Diagnostic complete.\n');

  await pool.end();
}

run().catch(e => {
  console.error('\n❌  Unexpected error:', e.message);
  process.exit(1);
});
