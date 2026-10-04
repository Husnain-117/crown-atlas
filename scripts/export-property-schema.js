/**
 * Script to export property schema from MongoDB
 * This creates CSV and JSON files with all column names and sample values.
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { writeCsv } = require('./lib/write-csv');

// MongoDB connection
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'crowncoastal';

async function exportPropertySchema() {
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  const client = new MongoClient(uri);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection('properties');

    // Fetch one property document to analyze the schema
    console.log('📊 Fetching sample property...');
    const sampleProperty = await collection.findOne({});

    if (!sampleProperty) {
      console.log('❌ No properties found in the database');
      return;
    }

    console.log('✅ Found sample property');

    // Function to flatten nested objects with dot notation
    function flattenObject(obj, prefix = '') {
      const flattened = {};

      for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          // Recursively flatten nested objects
          Object.assign(flattened, flattenObject(value, newKey));
        } else {
          // Handle different data types
          let displayValue;

          if (Array.isArray(value)) {
            // For arrays, show sample values
            displayValue = value.length > 0
              ? `[${value.slice(0, 3).map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(', ')}${value.length > 3 ? ', ...' : ''}]`
              : '[]';
          } else if (value instanceof Date) {
            displayValue = value.toISOString();
          } else if (typeof value === 'object' && value !== null) {
            displayValue = JSON.stringify(value);
          } else {
            displayValue = value;
          }

          flattened[newKey] = displayValue;
        }
      }

      return flattened;
    }

    // Flatten the property document
    const flattenedProperty = flattenObject(sampleProperty);

    // Create data for Excel
    const excelData = Object.entries(flattenedProperty).map(([columnName, sampleValue]) => ({
      'Column Name': columnName,
      'Sample Value': sampleValue,
      'Data Type': typeof sampleValue === 'object' && sampleValue !== null
        ? Array.isArray(sampleValue) ? 'Array' : 'Object'
        : typeof sampleValue
    }));

    // Sort by column name for better readability
    excelData.sort((a, b) => a['Column Name'].localeCompare(b['Column Name']));

    // Generate output filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const outputDir = path.join(__dirname, '..', 'exports');

    // Create exports directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, `property-schema-${timestamp}.csv`);

    writeCsv(excelData, outputPath);

    console.log('✅ CSV file created successfully!');
    console.log(`📄 File location: ${outputPath}`);
    console.log(`📊 Total columns: ${excelData.length}`);

    // Also create a JSON version for reference
    const jsonPath = path.join(outputDir, `property-schema-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(excelData, null, 2));
    console.log(`📄 JSON file also created: ${jsonPath}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
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
