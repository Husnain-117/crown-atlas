/**
 * Helper script to format Google Service Account credentials
 * This script helps you convert the downloaded JSON file into the correct format
 * for your .env.local file.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function formatCredentials() {
  console.log('🔧 Google Service Account Credentials Formatter\n');
  console.log('This script will help you format your credentials for .env.local\n');

  const method = await question(
    'Do you have the JSON file downloaded? (yes/no): '
  );

  if (method.toLowerCase() !== 'yes') {
    console.log('\n📝 Please follow these steps first:');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Create a project and enable Google Sheets API');
    console.log('3. Create a service account and download the JSON key');
    console.log('4. Then run this script again\n');
    console.log('📖 See GOOGLE_CLOUD_SETUP_STEPS.md for detailed instructions\n');
    rl.close();
    return;
  }

  const filePath = await question(
    '\nEnter the path to your downloaded JSON file (or drag and drop it here): '
  );

  const cleanPath = filePath.trim().replace(/^["']|["']$/g, '');

  try {
    const fullPath = path.resolve(cleanPath);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`\n❌ File not found: ${fullPath}`);
      rl.close();
      return;
    }

    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const credentials = JSON.parse(fileContent);

    // Validate it's a service account key
    if (!credentials.client_email || !credentials.private_key) {
      console.error('\n❌ This does not appear to be a valid service account key file');
      console.error('   Make sure you downloaded the JSON key from Google Cloud Console');
      rl.close();
      return;
    }

    console.log('\n✅ Credentials file loaded successfully!');
    console.log(`   Service Account Email: ${credentials.client_email}`);
    console.log(`   Project ID: ${credentials.project_id}\n`);

    // Format as single-line JSON string
    const jsonString = JSON.stringify(credentials);

    console.log('📋 Add this to your .env.local file:\n');
    console.log('─'.repeat(80));
    console.log(`GOOGLE_CREDENTIALS='${jsonString}'`);
    console.log('─'.repeat(80));
    console.log('\n💡 Copy the line above and paste it into your .env.local file\n');

    // Option to save to a file
    const saveToFile = await question(
      'Would you like to save this to a temporary file? (yes/no): '
    );

    if (saveToFile.toLowerCase() === 'yes') {
      const outputPath = path.join(process.cwd(), 'google-credentials-formatted.txt');
      fs.writeFileSync(outputPath, `GOOGLE_CREDENTIALS='${jsonString}'`);
      console.log(`\n✅ Saved to: ${outputPath}`);
      console.log('   You can copy the contents and add to .env.local\n');
    }

    // Option to copy service account email for sharing the sheet
    console.log('\n📧 Next step: Share your Google Sheet with this service account');
    console.log(`   Service Account Email: ${credentials.client_email}`);
    console.log('   Give it "Editor" permissions\n');

  } catch (error: any) {
    console.error(`\n❌ Error: ${error.message}`);
    if (error.message.includes('JSON')) {
      console.error('   The file does not appear to be valid JSON');
    }
  }

  rl.close();
}

// Run the formatter
if (typeof require !== 'undefined' && require.main === module) {
  formatCredentials().catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

export { formatCredentials };




