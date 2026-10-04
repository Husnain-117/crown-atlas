/**
 * Script to export property schema from PostgreSQL (DigitalOcean Droplet)
 * This will create an Excel file with all column names and sample values
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { writeCsv } = require('./lib/write-csv');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// PostgreSQL connection - use DATABASE_URL from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.log('Please set DATABASE_URL in your .env.local file');
  process.exit(1);
}

console.log('🔌 DATABASE_URL found');

const pool = new Pool({
  connectionString: connectionString,
  ssl: false, // DigitalOcean droplet doesn't use SSL
  connectionTimeoutMillis: 60000,
  query_timeout: 60000,
});

async function exportPropertySchema() {
  try {
    console.log('🔌 Connecting to PostgreSQL...');

    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Connected to PostgreSQL');

    // Get column information from the properties table
    console.log('📊 Fetching table schema...');
    const schemaQuery = `
      SELECT
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'properties'
      ORDER BY ordinal_position;
    `;

    const schemaResult = await pool.query(schemaQuery);
    console.log(`✅ Found ${schemaResult.rows.length} columns in properties table`);

    // Fetch one sample property to get actual values
    console.log('📊 Fetching sample property...');
    const sampleQuery = 'SELECT * FROM properties LIMIT 1';
    const sampleResult = await pool.query(sampleQuery);

    if (sampleResult.rows.length === 0) {
      console.log('❌ No properties found in the database');
      return;
    }

    const sampleProperty = sampleResult.rows[0];
    console.log('✅ Found sample property');

    // Create data for Excel
    const excelData = schemaResult.rows.map(column => {
      const columnName = column.column_name;
      let sampleValue = sampleProperty[columnName];

      // Format sample value for display
      if (sampleValue === null || sampleValue === undefined) {
        sampleValue = 'NULL';
      } else if (typeof sampleValue === 'object') {
        sampleValue = JSON.stringify(sampleValue);
      } else if (sampleValue instanceof Date) {
        sampleValue = sampleValue.toISOString();
      } else {
        sampleValue = String(sampleValue);
      }

      // Truncate long values
      if (sampleValue.length > 100) {
        sampleValue = sampleValue.substring(0, 100) + '...';
      }

      return {
        'Column Name': columnName,
        'Data Type': column.data_type,
        'Max Length': column.character_maximum_length || '-',
        'Nullable': column.is_nullable,
        'Default': column.column_default || '-',
        'Sample Value': sampleValue
      };
    });

    // Generate output filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const outputDir = path.join(__dirname, '..', 'exports');

    // Create exports directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `property-schema-postgres-${timestamp}.csv`);

    writeCsv(excelData, outputPath);

    console.log('✅ CSV file created successfully!');
    console.log(`📄 File location: ${outputPath}`);
    console.log(`📊 Total columns: ${excelData.length}`);

    // Also create a JSON version for reference
    const jsonPath = path.join(outputDir, `property-schema-postgres-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(excelData, null, 2));
    console.log(`📄 JSON file also created: ${jsonPath}`);

    // Get count of properties
    const countResult = await pool.query('SELECT COUNT(*) FROM properties');
    console.log(`📊 Total properties in database: ${countResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error details:', error.message);
  } finally {
    await pool.end();
    console.log('🔌 PostgreSQL connection closed');
  }
}

// Run the export
exportPropertySchema().then(() => {
  console.log('✅ Export completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Export failed:', error);
  process.exit(1);
});
