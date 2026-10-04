import { BLOG_DRAFT_INSTRUCTIONS, createBlogDraftReview, parseBlogDraft } from '../src/lib/blog-editorial';
/**
 * Simple blog generation script using JSON file (no Google Sheets API required)
 * This script reads from data/blog-topics.json and generates blogs
 */

import { MongoClient } from 'mongodb';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// Environment variables
const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'crowncoastal';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

interface BlogTopic {
  language: string;
  city: string;
  topic: string;
  keyword: string;
  group_id: string;
}

// Generate slug from keyword
function generateSlug(keyword: string): string {
  return keyword
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() || keyword;
}

// Calculate reading time
function calculateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200);
}

// Get image query based on topic
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

// Fetch image from Pexels
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

// Generate blog content using OpenAI
async function generateBlogContent(topic: string, keyword: string, city: string | undefined, imageUrl: string | null): Promise<any> {
  const prompt = `Generate a professional real estate blog post in ENGLISH for Crown Coastal Homes, a luxury real estate company specializing in Southern California coastal properties. Return ONLY valid JSON.

**Topic:** ${topic}
**Keyword:** ${keyword}
${city ? `**City:** ${city}` : ''}
${imageUrl ? `**Image:** ${imageUrl}` : ''}

**Requirements:**
- ALL content in English
- 4-5 minutes reading time (approximately 800-1000 words)
- Professional but approachable tone for affluent international buyers
- Use markdown formatting: # for title, ## for sections, - for bullet points, **bold** for emphasis
- Focus on luxury real estate, investment potential, and lifestyle benefits
- Include practical research steps and questions buyers should investigate

${BLOG_DRAFT_INSTRUCTIONS}

**Return this exact JSON structure:**

{
  "title": "Professional English title for the blog post",
  "summary": "Brief English description in 1-2 sentences",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
  "content": "Full markdown content in English with # title, ## sections, bullet points, and examples"
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

  return parseBlogDraft(JSON.parse(completion.choices[0].message.content || '{}'));
}

// Automated output remains a draft until a documented editorial review.
function addSchemaMarkup(jsonObj: any, _slug: string) {
  return {
    title: jsonObj.title,
    summary: jsonObj.summary,
    tags: jsonObj.tags,
    content: jsonObj.content,
    imageUrl: jsonObj.imageUrl || '',
    schema_markup: {},
    status: 'draft',
    editorial: createBlogDraftReview(),
    featured: false,
    publishedAt: '',
  };
}

// Process a single topic
async function processTopic(topic: BlogTopic, db: any) {
  try {
    console.log(`\n🔄 Processing: ${topic.keyword}`);

    // Generate image query and fetch image
    const imageQuery = getImageQuery(topic.topic);
    console.log(`📸 Image query: ${imageQuery}`);
    const imageUrl = await fetchImageFromPexels(imageQuery);
    console.log(`✅ Image fetched: ${imageUrl ? 'Yes' : 'No'}`);

    // Generate slug
    const slug = generateSlug(topic.keyword);
    console.log(`🔗 Slug: ${slug}`);

    // Generate blog content
    console.log(`🤖 Generating blog content...`);
    const generatedContent = await generateBlogContent(topic.topic, topic.keyword, topic.city, imageUrl);

    // Add schema markup
    const blogData = addSchemaMarkup(generatedContent, slug);

    // Calculate reading time
    const readingTime = calculateReadingTime(blogData.content);

    // Create complete blog post
    const now = new Date().toISOString();
    const blogPost = {
      ...blogData,
      createdAt: now,
      updatedAt: now,
      slug,
      category: topic.topic,
      city: topic.city || undefined,
      topic: topic.topic,
      keyword: topic.keyword,
      groupId: topic.group_id || undefined,
      language: 'en',
      readingTime,
      author: {
        name: 'Crown Coastal Homes',
        organization: 'Crown Coastal Homes',
      },
    };

    // Save to MongoDB
    const result = await db.collection('blogs').insertOne(blogPost);
    console.log(`✅ Blog saved to MongoDB: ${result.insertedId}`);

    return { success: true, blogPost, topic };
  } catch (error: any) {
    console.error(`❌ Error processing ${topic.keyword}:`, error.message);
    throw error;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting blog generation from JSON file...\n');

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not set');
    process.exit(1);
  }

  if (!OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is not set');
    process.exit(1);
  }

  // Load topics from JSON file
  const topicsPath = path.join(process.cwd(), 'data', 'blog-topics.json');
  if (!fs.existsSync(topicsPath)) {
    console.error(`❌ Topics file not found: ${topicsPath}`);
    process.exit(1);
  }

  const topics: BlogTopic[] = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
  console.log(`📋 Loaded ${topics.length} topics from JSON file\n`);

  // Connect to MongoDB
  const client = new MongoClient(MONGODB_URI, {
    tls: true,
    tlsAllowInvalidCertificates: false,
  });

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    const db = client.db(MONGODB_DB_NAME);

    // Get existing blogs to avoid duplicates
    const existingBlogs = await db.collection('blogs').find({}, { projection: { slug: 1, keyword: 1 } }).toArray();
    const existingKeywords = new Set(existingBlogs.map((b: any) => b.keyword));
    console.log(`📊 Found ${existingKeywords.size} existing blogs in database\n`);

    // Filter for English topics that haven't been generated
    const availableTopics = topics.filter(
      (topic) => topic.language.toUpperCase() === 'EN' && !existingKeywords.has(topic.keyword)
    );

    console.log(`🌐 Found ${availableTopics.length} English topics to process\n`);

    if (availableTopics.length === 0) {
      console.log('ℹ️  All topics have been generated. Add more topics to data/blog-topics.json');
      return;
    }

    // Process each topic
    for (const topic of availableTopics) {
      try {
        await processTopic(topic, db);
        console.log(`✅ Completed: ${topic.keyword}\n`);

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Failed to process ${topic.keyword}:`, error);
        // Continue with next topic
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

// Run the script
if (typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error);
}

export { main };




