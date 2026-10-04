#!/usr/bin/env node

/**
 * Trestle Property Sync Cron Job
 *
 * This script runs on a DigitalOcean Droplet via cron (daily at 2 AM)
 * It fetches properties from Trestle API and saves them to PostgreSQL
 *
 * Setup:
 * 1. Copy this file to droplet: /opt/trestle-sync/sync.js
 * 2. Install dependencies: npm install pg axios dotenv
 * 3. Create .env file with credentials
 * 4. Add to cron: 0 2 * * * node /opt/trestle-sync/sync.js >> /var/log/trestle-sync.log 2>&1
 */

require('dotenv').config();
const { Pool } = require('pg');
const axios = require('axios');

// ==================== CONFIGURATION ====================

const TRESTLE_API_ID = process.env.TRESTLE_API_ID;
const TRESTLE_API_PASSWORD = process.env.TRESTLE_API_PASSWORD;
const TRESTLE_BASE_URL = process.env.TRESTLE_BASE_URL || 'https://api-trestle.corelogic.com/trestle/odata';
const TRESTLE_OAUTH_URL = process.env.TRESTLE_OAUTH_URL || 'https://api-trestle.corelogic.com/trestle/oidc/connect/token';

const DATABASE_URL = process.env.DATABASE_URL;

if (!TRESTLE_API_ID || !TRESTLE_API_PASSWORD) {
  console.error('❌ ERROR: TRESTLE_API_ID and TRESTLE_API_PASSWORD are required');
  process.exit(1);
}

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is required');
  process.exit(1);
}

// ==================== DATABASE SETUP ====================

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

// ==================== TRESTLE API CLIENT ====================

class TrestleAPIClient {
  constructor() {
    this.tokenCache = null;
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  async getAccessToken() {
    if (this.tokenCache && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache.token;
    }

    console.log('🔑 Requesting OAuth2 token from Trestle...');

    const response = await axios.post(
      TRESTLE_OAUTH_URL,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: TRESTLE_API_ID,
        client_secret: TRESTLE_API_PASSWORD,
        scope: 'api',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        timeout: 10000,
      }
    );

    const { access_token, expires_in } = response.data;

    this.tokenCache = {
      token: access_token,
      expiresAt: Date.now() + (expires_in - 300) * 1000,
    };

    console.log('✅ OAuth2 token obtained');
    return access_token;
  }

  async fetchProperties(filters = {}) {
    const token = await this.getAccessToken();

    const params = {
      $select: [
        'ListingKey',
        'ListPrice',
        'UnparsedAddress',
        'StandardStatus',
        'PropertyType',
        'PropertySubType',
        'BedroomsTotal',
        'BathroomsTotalInteger',
        'LivingArea',
        'LotSizeSquareFeet',
        'YearBuilt',
        'OnMarketDate',
        'ModificationTimestamp',
        'City',
        'StateOrProvince',
        'PostalCode',
        'CountyOrParish',
        'Latitude',
        'Longitude',
        'ListAgentName',
        'ListAgentDRE',
        'PublicRemarks',
        'PhotosCount',
        'VirtualTourURLUnbranded',
        'PoolPrivateYN',
        'WaterfrontYN',
        'ViewYN',
        'ParkingTotal',
        'SchoolDistrict',
        'ElementarySchool',
        'MiddleOrJuniorSchool',
        'HighSchool',
        'WalkScore'
      ].join(','),
      $filter: "StandardStatus eq 'Active' and PropertyType ne 'Land'",
      $orderby: 'ModificationTimestamp desc',
      $top: filters.limit || 1000
    };

    console.log('📥 Fetching properties from Trestle API...');
    console.log('   Filter:', params.$filter);
    console.log('   Limit:', params.$top);

    const response = await this.axiosInstance.get(
      `${TRESTLE_BASE_URL}/Property`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      }
    );

    return response.data.value || [];
  }
}

// ==================== DATABASE FUNCTIONS ====================

async function ensurePropertiesTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS properties (
        listing_key TEXT PRIMARY KEY,
        list_price NUMERIC,
        bedrooms_total INTEGER,
        bathrooms_total INTEGER,
        living_area NUMERIC,
        lot_size_sq_ft NUMERIC,
        property_type TEXT,
        property_sub_type TEXT,
        city TEXT,
        state_or_province TEXT,
        postal_code TEXT,
        county_or_parish TEXT,
        latitude NUMERIC,
        longitude NUMERIC,
        year_built INTEGER,
        status TEXT,
        mls_status TEXT,
        public_remarks TEXT,
        photos_count INTEGER,
        main_photo_url TEXT,
        media_urls TEXT,
        virtual_tour_url TEXT,
        pool_private_yn BOOLEAN,
        waterfront_yn BOOLEAN,
        view_yn BOOLEAN,
        parking_total INTEGER,
        school_district_name TEXT,
        elementary_school_name TEXT,
        middle_school_name TEXT,
        high_school_name TEXT,
        walk_score NUMERIC,
        list_agent_dre TEXT,
        list_agent_full_name TEXT,
        on_market_date TIMESTAMPTZ,
        modification_timestamp TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
      CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state_or_province);
      CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(list_price);
      CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
      CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
      CREATE INDEX IF NOT EXISTS idx_properties_updated ON properties(updated_at);
    `);
    console.log('✅ Properties table ensured');
  } finally {
    client.release();
  }
}

async function upsertProperty(client, property) {
  const query = `
    INSERT INTO properties (
      listing_key, list_price, bedrooms_total, bathrooms_total, living_area,
      lot_size_sq_ft, property_type, property_sub_type, city, state_or_province,
      postal_code, county_or_parish, latitude, longitude, year_built,
      status, mls_status, public_remarks, photos_count, virtual_tour_url,
      pool_private_yn, waterfront_yn, view_yn, parking_total,
      school_district_name, elementary_school_name, middle_school_name,
      high_school_name, walk_score, list_agent_dre, list_agent_full_name,
      on_market_date, modification_timestamp, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
      $31, $32, $33, NOW()
    )
    ON CONFLICT (listing_key) DO UPDATE SET
      list_price = EXCLUDED.list_price,
      bedrooms_total = EXCLUDED.bedrooms_total,
      bathrooms_total = EXCLUDED.bathrooms_total,
      living_area = EXCLUDED.living_area,
      lot_size_sq_ft = EXCLUDED.lot_size_sq_ft,
      property_type = EXCLUDED.property_type,
      property_sub_type = EXCLUDED.property_sub_type,
      city = EXCLUDED.city,
      state_or_province = EXCLUDED.state_or_province,
      postal_code = EXCLUDED.postal_code,
      county_or_parish = EXCLUDED.county_or_parish,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      year_built = EXCLUDED.year_built,
      status = EXCLUDED.status,
      mls_status = EXCLUDED.mls_status,
      public_remarks = EXCLUDED.public_remarks,
      photos_count = EXCLUDED.photos_count,
      virtual_tour_url = EXCLUDED.virtual_tour_url,
      pool_private_yn = EXCLUDED.pool_private_yn,
      waterfront_yn = EXCLUDED.waterfront_yn,
      view_yn = EXCLUDED.view_yn,
      parking_total = EXCLUDED.parking_total,
      school_district_name = EXCLUDED.school_district_name,
      elementary_school_name = EXCLUDED.elementary_school_name,
      middle_school_name = EXCLUDED.middle_school_name,
      high_school_name = EXCLUDED.high_school_name,
      walk_score = EXCLUDED.walk_score,
      list_agent_dre = EXCLUDED.list_agent_dre,
      list_agent_full_name = EXCLUDED.list_agent_full_name,
      on_market_date = EXCLUDED.on_market_date,
      modification_timestamp = EXCLUDED.modification_timestamp,
      updated_at = NOW()
  `;

  const values = [
    property.ListingKey,
    property.ListPrice || null,
    property.BedroomsTotal || null,
    property.BathroomsTotalInteger || null,
    property.LivingArea || null,
    property.LotSizeSquareFeet || null,
    property.PropertyType || null,
    property.PropertySubType || null,
    property.City || null,
    property.StateOrProvince || null,
    property.PostalCode || null,
    property.CountyOrParish || null,
    property.Latitude || null,
    property.Longitude || null,
    property.YearBuilt || null,
    property.StandardStatus || null,
    property.StandardStatus || null, // mls_status
    property.PublicRemarks || null,
    property.PhotosCount || 0,
    property.VirtualTourURLUnbranded || null,
    property.PoolPrivateYN || false,
    property.WaterfrontYN || false,
    property.ViewYN || false,
    property.ParkingTotal || null,
    property.SchoolDistrict || null,
    property.ElementarySchool || null,
    property.MiddleOrJuniorSchool || null,
    property.HighSchool || null,
    property.WalkScore || null,
    property.ListAgentDRE || null,
    property.ListAgentName || null,
    property.OnMarketDate || null,
    property.ModificationTimestamp || null
  ];

  await client.query(query, values);
}

// ==================== MAIN SYNC FUNCTION ====================

async function syncProperties() {
  const startTime = Date.now();
  console.log('\n========================================');
  console.log('🚀 Trestle Property Sync Started');
  console.log('========================================');
  console.log('Time:', new Date().toISOString());

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  try {
    // 1. Ensure table exists
    await ensurePropertiesTable();

    // 2. Fetch properties from Trestle
    const trestleClient = new TrestleAPIClient();
    const properties = await trestleClient.fetchProperties({ limit: 10000 });

    console.log(`📊 Fetched ${properties.length} properties from Trestle`);

    if (properties.length === 0) {
      console.log('⚠️  No properties fetched. Exiting.');
      return;
    }

    // 3. Upsert to database
    console.log('💾 Saving properties to database...');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const property of properties) {
        try {
          // Check if exists
          const checkResult = await client.query(
            'SELECT listing_key FROM properties WHERE listing_key = $1',
            [property.ListingKey]
          );

          const exists = checkResult.rows.length > 0;

          await upsertProperty(client, property);

          if (exists) {
            updated++;
          } else {
            inserted++;
          }

          // Progress indicator every 100 properties
          if ((inserted + updated) % 100 === 0) {
            console.log(`   Progress: ${inserted + updated}/${properties.length}`);
          }
        } catch (err) {
          errors++;
          console.error(`❌ Error saving property ${property.ListingKey}:`, err.message);
        }
      }

      await client.query('COMMIT');
      console.log('✅ Transaction committed');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('❌ Transaction rolled back:', err.message);
      throw err;
    } finally {
      client.release();
    }

    // 4. Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n========================================');
    console.log('✅ Sync Completed Successfully');
    console.log('========================================');
    console.log(`📊 Summary:`);
    console.log(`   - Properties fetched: ${properties.length}`);
    console.log(`   - New properties: ${inserted}`);
    console.log(`   - Updated properties: ${updated}`);
    console.log(`   - Errors: ${errors}`);
    console.log(`   - Duration: ${duration}s`);
    console.log(`   - Time: ${new Date().toISOString()}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('\n========================================');
    console.error('❌ Sync Failed');
    console.error('========================================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================================\n');
    throw error;
  } finally {
    await pool.end();
  }
}

// ==================== RUN ====================

syncProperties()
  .then(() => {
    console.log('✅ Sync job completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Sync job failed:', error);
    process.exit(1);
  });
