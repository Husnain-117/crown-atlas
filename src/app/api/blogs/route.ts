import { NextRequest, NextResponse } from 'next/server';
import { getPublishedArticles } from '@/lib/blog-postgres';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');
    const city = searchParams.get('city') || undefined;

    // Fetch blogs from PostgreSQL
    const { articles, total } = await getPublishedArticles({
      limit,
      skip,
      city,
    });

    return NextResponse.json({
      success: true,
      data: articles,
      total,
      limit,
      skip,
    });
  } catch (error: any) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch blogs',
      },
      { status: 500 }
    );
  }
}
