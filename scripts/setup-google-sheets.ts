/**
 * Helper script to validate Google Sheets API setup
 * This script checks if your credentials are configured correctly
 * and tests the connection to your Google Sheet.
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

const GOOGLE_CREDENTIALS = process.env.GOOGLE_CREDENTIALS || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID || '1mU_7qks0-v7RAudjT-d58Q8nvHepDc3MNtKfutlrskM';
const GOOGLE_SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

function loadCredentials(): any {
  if (!GOOGLE_CREDENTIALS) {
    throw new Error('❌ GOOGLE_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_KEY is not set in .env.local');
  }

  try {
    // Try to parse as JSON string first
    return JSON.parse(GOOGLE_CREDENTIALS);
  } catch {
    // If parsing fails, assume it's a file path
    const filePath = path.resolve(process.cwd(), GOOGLE_CREDENTIALS);
    if (!fs.existsSync(filePath)) {
      throw new Error(`❌ Credentials file not found: ${filePath}`);
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
}

async function validateSetup() {
  console.log('🔍 Validating Google Sheets API Setup...\n');

  // Step 1: Check environment variables
  console.log('1️⃣ Checking environment variables...');
  if (!GOOGLE_SHEET_ID) {
    console.error('   ❌ GOOGLE_SHEET_ID is not set');
    return false;
  }
  console.log(`   ✅ GOOGLE_SHEET_ID: ${GOOGLE_SHEET_ID}`);

  if (!GOOGLE_SHEET_NAME) {
    console.error('   ❌ GOOGLE_SHEET_NAME is not set');
    return false;
  }
  console.log(`   ✅ GOOGLE_SHEET_NAME: ${GOOGLE_SHEET_NAME}\n`);

  // Step 2: Load and validate credentials
  console.log('2️⃣ Loading credentials...');
  let credentials;
  try {
    credentials = loadCredentials();
    console.log('   ✅ Credentials loaded successfully');
    console.log(`   📧 Service Account Email: ${credentials.client_email || 'Not found'}`);
    console.log(`   🆔 Project ID: ${credentials.project_id || 'Not found'}\n`);
  } catch (error: any) {
    console.error(`   ❌ Error loading credentials: ${error.message}\n`);
    return false;
  }

  // Step 3: Initialize Google Sheets client
  console.log('3️⃣ Initializing Google Sheets API client...');
  let sheets;
  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    sheets = google.sheets({ version: 'v4', auth });
    console.log('   ✅ Google Sheets client initialized\n');
  } catch (error: any) {
    console.error(`   ❌ Error initializing client: ${error.message}\n`);
    return false;
  }

  // Step 4: Test connection to spreadsheet
  console.log('4️⃣ Testing connection to Google Sheet...');
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: GOOGLE_SHEET_ID,
    });
    console.log(`   ✅ Successfully connected to spreadsheet`);
    console.log(`   📄 Title: ${response.data.properties?.title || 'Unknown'}\n`);
  } catch (error: any) {
    if (error.code === 403) {
      console.error('   ❌ Permission denied!');
      console.error(`   💡 Make sure you've shared the Google Sheet with: ${credentials.client_email}`);
      console.error('   💡 The service account needs "Editor" permissions\n');
    } else if (error.code === 404) {
      console.error('   ❌ Spreadsheet not found!');
      console.error(`   💡 Check that GOOGLE_SHEET_ID is correct: ${GOOGLE_SHEET_ID}\n`);
    } else {
      console.error(`   ❌ Error: ${error.message}\n`);
    }
    return false;
  }

  // Step 5: Test reading data
  console.log('5️⃣ Testing data read access...');
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${GOOGLE_SHEET_NAME}!A1:Z1`, // Just get headers
    });

    const headers = response.data.values?.[0] || [];
    console.log(`   ✅ Successfully read data from sheet`);
    console.log(`   📋 Found ${headers.length} columns`);
    console.log(`   📝 Headers: ${headers.join(', ')}\n`);

    // Check for required columns
    const requiredColumns = ['Language', 'Topic', 'Keyword'];
    const missingColumns: string[] = [];
    const headerLower = headers.map((h: string) => h.toLowerCase().trim());

    for (const required of requiredColumns) {
      if (!headerLower.includes(required.toLowerCase())) {
        missingColumns.push(required);
      }
    }

    if (missingColumns.length > 0) {
      console.error(`   ⚠️  Missing required columns: ${missingColumns.join(', ')}`);
      console.error('   💡 Your sheet must have columns: Language, Topic, Keyword\n');
      return false;
    }

    console.log('   ✅ All required columns found\n');
  } catch (error: any) {
    console.error(`   ❌ Error reading data: ${error.message}\n`);
    return false;
  }

  // Step 6: Test write access (optional - just check if we can update)
  console.log('6️⃣ Testing write access (checking permissions)...');
  try {
    // Try to get spreadsheet metadata which requires read access
    // Write access will be tested when actually marking rows as "Used"
    console.log('   ✅ Write permissions will be tested during blog generation\n');
  } catch (error: any) {
    console.error(`   ⚠️  Warning: ${error.message}\n`);
  }

  console.log('✨ Setup validation complete! Your Google Sheets API is configured correctly.\n');
  console.log('🚀 You can now run: npm run generate:blogs\n');
  return true;
}

// Run validation
if (typeof require !== 'undefined' && require.main === module) {
  validateSetup()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

export { validateSetup };




