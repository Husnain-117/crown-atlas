/**
 * Script to generate blogs from Google Sheets following the n8n workflow
 * This script replicates the n8n workflow logic:
 * 1. Fetch Google Sheet rows
 * 2. Filter rows where Used != "true"
 * 3. Filter for English language (EN)
 * 4. Generate image query based on topic
 * 5. Fetch images from Pexels
 * 6. Generate blog in English using OpenAI
 * 7. Add schema markup
 * 8. Save to MongoDB
 * 9. Update Google Sheet to mark as "Used"
 */

import { MongoClient } from 'mongodb';
import OpenAI from 'openai';
import { google } from 'googleapis';

// Environment variables
const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'crowncoastal';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID || '1mU_7qks0-v7RAudjT-d58Q8nvHepDc3MNtKfutlrskM';
const GOOGLE_SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Sheet1';
const GOOGLE_CREDENTIALS = process.env.GOOGLE_CREDENTIALS || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Sheet row structure
interface SheetRow {
  Language: string;
  City: string;
  Topic: string;
  Keyword: string;
  'Group ID': string;
  Used: string;
  row_number: number;
}

// Generate image query based on topic (real estate topics)
function getImageQuery(topic: string): string {
  const topicQueries: Record<string, string> = {
    'Luxury Real Estate': 'luxury real estate mansion',
    'Investment Properties': 'real estate investment property',
    'Beachfront Properties': 'beachfront luxury home',
    'Coastal Living': 'coastal luxury home ocean view',
    'Market Trends': 'real estate market data',
    'Home Buying': 'luxury home interior design',
    'Home Selling': 'modern home exterior',
    'Neighborhood Guide': 'luxury neighborhood street',
    'Property Management': 'property management building',
    'Real Estate Tips': 'real estate professional',
    'Luxury Homes': 'luxury mansion california',
    'Waterfront Properties': 'waterfront luxury home',
    'Real Estate Investment': 'real estate investment',
  };

  return topicQueries[topic] || 'luxury real estate california';
}

// Fetch image from Pexels (matching n8n workflow)
async function fetchImageFromPexels(query: string): Promise<string | null> {
  try {
    const page = Math.floor(Math.random() * 20) + 1;
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=4&page=${page}`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error('Pexels API error:', response.status);
      return null;
    }

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.large || data.photos[0].src.original;
    }
    return null;
  } catch (error) {
    console.error('Error fetching image from Pexels:', error);
    return null;
  }
}

// Generate slug from keyword (matching n8n workflow exactly)
function generateSlug(keyword: string): string {
  return keyword
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || keyword;
}

// Calculate reading time
function calculateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200);
}

// Generate blog using OpenAI (matching n8n workflow)
async function generateBlogContent(topic: string, keyword: string, city: string | undefined, imageUrl: string | null): Promise<any> {
  const prompt = `Generate a professional real estate blog post in ENGLISH for Crown Coastal Homes, a luxury real estate company specializing in Southern California coastal properties. Return ONLY valid JSON.

**Variables:**
- Topic: ${topic}
- Keyword: ${keyword}
${city ? `- City: ${city}` : ''}
- Image: ${imageUrl || 'N/A'}

**Requirements:**
- ALL content in English
- 4 minutes reading time (approximately 600-800 words)
- Professional but approachable tone
- Use markdown formatting: # for title, ## for sections, - for bullet points, **bold** for emphasis

**Return this exact JSON structure:**

{
  "title": "English title for the blog post",
  "summary": "Brief English description of the blog post in 1-2 sentences",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
  "content": "Full markdown content in English with # title, ## sections, bullet points, and examples",
  "imageUrl": "${imageUrl || ''}"
}

**Content structure to follow:**
# [Title]

[Engaging introduction about the topic and its relevance to luxury real estate...]

## Why This Matters
- Benefit 1
- Benefit 2
- Benefit 3

## Key Insights
[Detailed explanation with examples...]

## Practical Applications
[Step-by-step guidance or examples if relevant...]

## Conclusion
[Summary and next steps...]

CRITICAL: Return ONLY the JSON object. No markdown wrapper, no code blocks around JSON, no explanations.`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a luxury real estate content expert specializing in Southern California markets for international UHNW clients. Generate ONLY valid JSON with no additional text.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}

// Add schema markup (matching n8n workflow)
function addSchemaMarkup(jsonObj: any, slug: string) {
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: jsonObj.title || '',
    description: jsonObj.summary || '',
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Crown Coastal Homes',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Crown Coastal Homes',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.crowncoastalhomes.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.crowncoastalhomes.com/blogs/${slug}`,
    },
    image: {
      '@type': 'ImageObject',
      url: jsonObj.imageUrl || '',
      width: 1200,
      height: 630,
    },
    keywords: Array.isArray(jsonObj.tags) ? jsonObj.tags.join(', ') : '',
  };

  return {
    title: jsonObj.title || '',
    summary: jsonObj.summary || '',
    tags: jsonObj.tags || [],
    content: jsonObj.content || '',
    imageUrl: jsonObj.imageUrl || '',
    schema_markup: schemaMarkup,
    status: 'published',
    featured: false,
    publishedAt: new Date().toISOString(),
  };
}

// Process a single row (matching n8n workflow steps)
async function processRow(row: SheetRow, db: any) {
  try {
    console.log(`\n🔄 Processing row ${row.row_number}: ${row.Keyword}`);

    // Step 1: Generate image query based on topic
    const imageQuery = getImageQuery(row.Topic);
    console.log(`📸 Image query: ${imageQuery}`);

    // Step 2: Fetch image from Pexels
    const imageUrl = await fetchImageFromPexels(imageQuery);
    console.log(`✅ Image fetched: ${imageUrl ? 'Yes' : 'No'}`);

    // Step 3: Generate slug
    const slug = generateSlug(row.Keyword);
    console.log(`🔗 Slug: ${slug}`);

    // Step 4: Generate blog content
    console.log(`🤖 Generating blog content...`);
    const generatedContent = await generateBlogContent(row.Topic, row.Keyword, row.City, imageUrl);

    // Step 5: Add schema markup
    const blogData = addSchemaMarkup(generatedContent, slug);

    // Step 6: Calculate reading time
    const readingTime = calculateReadingTime(blogData.content);

    // Step 7: Create complete blog post
    const now = new Date().toISOString();
    const blogPost = {
      ...blogData,
      createdAt: now,
      updatedAt: now,
      slug,
      category: row.Topic,
      city: row.City || undefined,
      topic: row.Topic,
      keyword: row.Keyword,
      groupId: row['Group ID'] || undefined,
      language: 'en',
      readingTime,
      author: {
        name: 'Crown Coastal Homes',
        organization: 'Crown Coastal Homes',
      },
    };

    // Step 8: Save to MongoDB
    const result = await db.collection('blogs').insertOne(blogPost);
    console.log(`✅ Blog saved to MongoDB: ${result.insertedId}`);

    // Step 9: Mark as used in Google Sheet
    await markRowAsUsed(row);

    return { success: true, blogPost, row };
  } catch (error) {
    console.error(`❌ Error processing row ${row.row_number}:`, error);
    throw error;
  }
}

// Initialize Google Sheets API
function getGoogleSheetsClient() {
  const credentialSource = GOOGLE_CREDENTIALS;
  
  if (!credentialSource) {
    throw new Error('GOOGLE_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_KEY is required');
  }

  let credentials;
  try {
    // Try to parse as JSON string first
    credentials = JSON.parse(credentialSource);
  } catch {
    // If parsing fails, assume it's a file path
    const fs = require('fs');
    const path = require('path');
    const filePath = path.resolve(process.cwd(), credentialSource);
    credentials = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

// Fetch rows from Google Sheet
async function fetchGoogleSheetRows(): Promise<SheetRow[]> {
  try {
    const sheets = getGoogleSheetsClient();
    
    console.log(`📊 Fetching data from Google Sheet: ${GOOGLE_SHEET_ID}`);
    
    // Get all rows from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${GOOGLE_SHEET_NAME}!A:Z`, // Adjust range as needed
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log('⚠️  No data found in Google Sheet');
      return [];
    }

    // First row is headers
    const headers = rows[0].map((h: string) => h.trim());
    console.log(`📋 Headers found: ${headers.join(', ')}`);

    // Find column indices
    const languageIdx = headers.findIndex((h: string) => h.toLowerCase() === 'language');
    const cityIdx = headers.findIndex((h: string) => h.toLowerCase() === 'city');
    const topicIdx = headers.findIndex((h: string) => h.toLowerCase() === 'topic');
    const keywordIdx = headers.findIndex((h: string) => h.toLowerCase() === 'keyword');
    const groupIdIdx = headers.findIndex((h: string) => h.toLowerCase() === 'group id' || h.toLowerCase() === 'groupid');
    const usedIdx = headers.findIndex((h: string) => h.toLowerCase() === 'used');

    if (languageIdx === -1 || topicIdx === -1 || keywordIdx === -1) {
      throw new Error('Required columns (Language, Topic, Keyword) not found in sheet');
    }

    // Convert rows to SheetRow objects
    const sheetRows: SheetRow[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      sheetRows.push({
        Language: row[languageIdx]?.trim() || '',
        City: row[cityIdx]?.trim() || '',
        Topic: row[topicIdx]?.trim() || '',
        Keyword: row[keywordIdx]?.trim() || '',
        'Group ID': row[groupIdIdx]?.trim() || '',
        Used: row[usedIdx]?.trim() || '',
        row_number: i + 1, // +1 because header is row 1
      });
    }

    console.log(`✅ Fetched ${sheetRows.length} rows from Google Sheet`);
    return sheetRows;
  } catch (error: any) {
    console.error('❌ Error fetching Google Sheet rows:', error.message);
    if (error.message.includes('GOOGLE_CREDENTIALS')) {
      console.error('\n💡 To fix this:');
      console.error('1. Create a Google Service Account at https://console.cloud.google.com/');
      console.error('2. Download the JSON key file');
      console.error('3. Set GOOGLE_CREDENTIALS environment variable to the JSON content or file path');
      console.error('4. Share your Google Sheet with the service account email');
    }
    throw error;
  }
}

// Update Google Sheet to mark row as "Used"
async function markRowAsUsed(row: SheetRow): Promise<void> {
  try {
    const sheets = getGoogleSheetsClient();
    
    // Find the "Used" column index
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: `${GOOGLE_SHEET_NAME}!1:1`, // Get headers
    });

    const headers = response.data.values?.[0] || [];
    const usedColIdx = headers.findIndex((h: string) => h.toLowerCase() === 'used');
    
    if (usedColIdx === -1) {
      console.warn('⚠️  "Used" column not found, skipping update');
      return;
    }

    // Convert column index to letter (A=0, B=1, etc.)
    const colLetter = String.fromCharCode(65 + usedColIdx); // A-Z
    const range = `${GOOGLE_SHEET_NAME}!${colLetter}${row.row_number}`;

    // Update the cell
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['True']],
      },
    });

    console.log(`✅ Marked row ${row.row_number} as "Used" in Google Sheet`);
  } catch (error: any) {
    console.error(`❌ Error updating Google Sheet for row ${row.row_number}:`, error.message);
    // Don't throw - we don't want to fail the whole process if sheet update fails
  }
}

// Main function (matching n8n workflow)
async function main() {
  console.log('🚀 Starting blog generation from Google Sheets (n8n workflow)...\n');

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set');
    process.exit(1);
  }

  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is not set');
    process.exit(1);
  }

  // Connect to MongoDB
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    const db = client.db(MONGODB_DB_NAME);

    // Step 1: Fetch Google Sheet rows
    console.log('📊 Fetching Google Sheet rows...');
    const allRows = await fetchGoogleSheetRows();

    // Step 2: Filter rows where Used != "true"
    const unusedRows = allRows.filter((row) => row.Used !== 'true' && row.Used !== 'True');
    console.log(`📋 Found ${unusedRows.length} unused rows`);

    // Step 3: Filter for English language (EN)
    const englishRows = unusedRows.filter((row) => row.Language === 'EN' || row.Language === 'en');
    console.log(`🌐 Found ${englishRows.length} English rows to process\n`);

    if (englishRows.length === 0) {
      console.log('ℹ️  No unused English rows found. All blogs have been generated.');
      return;
    }

    // Process each row
    for (const row of englishRows) {
      try {
        await processRow(row, db);
        console.log(`✅ Completed row ${row.row_number}\n`);
        
        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Failed to process row ${row.row_number}:`, error);
        // Continue with next row
      }
    }

    console.log('\n✨ Blog generation complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run the script if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error);
}

export { main, processRow, fetchGoogleSheetRows, markRowAsUsed };
