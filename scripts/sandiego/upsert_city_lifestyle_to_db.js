/**
 * Upsert San Diego County cities Schools & Education and Lifestyle & Amenities
 * into city_lifestyle_research from generated JSON files.
 * Requires DATABASE_URL in .env or .env.local (repo root).
 * Run from repo root: node scripts/sandiego/upsert_city_lifestyle_to_db.js
 */

const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.local') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not set in .env or .env.local');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: false,
  connectionTimeoutMillis: 60000,
});

const OUTPUT_DIR = path.join(__dirname, 'output');

async function ensureTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS city_lifestyle_research (
      id SERIAL PRIMARY KEY,
      city_name VARCHAR(255) NOT NULL,
      city_slug VARCHAR(100) NOT NULL UNIQUE,
      schools_education TEXT,
      lifestyle_amenities TEXT,
      last_updated TIMESTAMPTZ DEFAULT NOW(),
      research_status VARCHAR(50) DEFAULT 'completed'
    )
  `);
  console.log('Table city_lifestyle_research ready.');
}

function loadJson(filename) {
  const p = path.join(OUTPUT_DIR, filename);
  if (!fs.existsSync(p)) {
    console.error('Missing file:', p);
    return null;
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

async function main() {
  const schools = loadJson('sandiego_cities_schools_education.json');
  const lifestyle = loadJson('sandiego_cities_lifestyle_amenities.json');
  if (!schools || !lifestyle) process.exit(1);

  const bySlug = new Map();
  for (const row of schools) {
    if (row.content) bySlug.set(row.slug, { name: row.name, slug: row.slug, schools_education: row.content, lifestyle_amenities: null });
  }
  for (const row of lifestyle) {
    const existing = bySlug.get(row.slug);
    if (existing) existing.lifestyle_amenities = row.content || null;
    else bySlug.set(row.slug, { name: row.name, slug: row.slug, schools_education: null, lifestyle_amenities: row.content || null });
  }

  await ensureTable(pool);

  let upserted = 0;
  for (const row of bySlug.values()) {
    const r = await pool.query(
      `INSERT INTO city_lifestyle_research (city_name, city_slug, schools_education, lifestyle_amenities, last_updated, research_status)
       VALUES ($1, $2, $3, $4, NOW(), 'completed')
       ON CONFLICT (city_slug) DO UPDATE SET
         city_name = EXCLUDED.city_name,
         schools_education = COALESCE(EXCLUDED.schools_education, city_lifestyle_research.schools_education),
         lifestyle_amenities = COALESCE(EXCLUDED.lifestyle_amenities, city_lifestyle_research.lifestyle_amenities),
         last_updated = NOW(),
         research_status = 'completed'`,
      [row.name, row.slug, row.schools_education || null, row.lifestyle_amenities || null]
    );
    if (r.rowCount) upserted++;
  }
  console.log('Upserted', upserted, 'rows into city_lifestyle_research.');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
