import { NextRequest, NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { BlogPost, BlogGenerationParams } from '@/lib/blog-models';
import OpenAI from 'openai';
import { authorizeServerRequest } from '@/lib/server-route-auth';
import { BLOG_DRAFT_INSTRUCTIONS, createBlogDraftReview, parseBlogDraft } from '@/lib/blog-editorial';

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
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

// Calculate reading time (average 200 words per minute)
function calculateReadingTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200);
}

// Fetch image from Pexels
async function fetchImageFromPexels(query: string): Promise<string | null> {
  try {
    const pexelsApiKey = process.env.PEXELS_API_KEY;
    if (!pexelsApiKey) {
      console.warn('[PEXELS] PEXELS_API_KEY is not set — skipping image fetch');
      return null;
    }
    const page = Math.floor(Math.random() * 20) + 1;
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=4&page=${page}`,
      {
        headers: {
          Authorization: pexelsApiKey,
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

// Generate image query based on topic
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
  };

  return topicQueries[topic] || 'luxury real estate california';
}

export async function POST(request: NextRequest) {
  const unauthorized = authorizeServerRequest(request, 'admin');
  if (unauthorized) return unauthorized;
  try {
    const body: BlogGenerationParams = await request.json();
    const { topic, keyword, city, category, groupId } = body;

    if (!topic || !keyword) {
      return NextResponse.json(
        { error: 'Topic and keyword are required' },
        { status: 400 }
      );
    }

    // Generate image query
    const imageQuery = getImageQuery(topic);
    const imageUrl = await fetchImageFromPexels(imageQuery);

    // Generate slug
    const slug = generateSlug(keyword);

    // Generate blog content using OpenAI
    const prompt = `Generate a professional real estate blog post for Crown Coastal Homes, a luxury real estate company specializing in Southern California coastal properties.

**Topic:** ${topic}
**Keyword:** ${keyword}
${city ? `**City:** ${city}` : ''}
${category ? `**Category:** ${category}` : ''}

**Requirements:**
- Write in professional, engaging English
- 4 minutes reading time (approximately 600-800 words)
- Professional but approachable tone for affluent international buyers
- Start with an engaging introduction about the topic
- Use markdown formatting: # for title, ## for sections, - for bullet points, **bold** for emphasis
- Focus on luxury real estate, investment potential, and lifestyle benefits
- Include practical research steps and questions buyers should investigate

${BLOG_DRAFT_INSTRUCTIONS}

**Return ONLY valid JSON with this exact structure:**

{
  "title": "Professional title for the blog post",
  "summary": "Brief description in 1-2 sentences",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"],
  "content": "Full markdown content with # title, ## sections, bullet points, and examples"
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

    const completion = await getOpenAIClient().chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini', // n8n uses gpt-4.1-mini, but gpt-4o-mini is equivalent
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

    const generatedContent = parseBlogDraft(JSON.parse(completion.choices[0].message.content || '{}'));

    // Calculate reading time
    const readingTime = calculateReadingTime(generatedContent.content || '');

    // Create blog post object
    const now = new Date().toISOString();
    const blogPost: BlogPost = {
      title: generatedContent.title || '',
      summary: generatedContent.summary || '',
      tags: generatedContent.tags || [],
      content: generatedContent.content || '',
      imageUrl: imageUrl || '',
      schema_markup: {},
      status: 'draft',
      featured: false,
      publishedAt: '',
      createdAt: now,
      updatedAt: now,
      slug,
      category: category || topic,
      city: city || undefined,
      topic,
      keyword,
      groupId: groupId || undefined,
      language: 'en',
      readingTime,
      author: {
        name: 'Crown Coastal Homes',
        organization: 'Crown Coastal Homes',
      },
    };

    // Save to MongoDB
    const db = await getMongoDb();
    const result = await db.collection<BlogPost>('blogs').insertOne({ ...blogPost, editorial: createBlogDraftReview(now) });

    return NextResponse.json({
      success: true,
      message: 'Draft saved for editorial review. It has not been published.',
      published: false,
      data: {
        ...blogPost,
        _id: result.insertedId.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error generating blog:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate blog post',
      },
      { status: 500 }
    );
  }
}






