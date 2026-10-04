import { NextRequest, NextResponse } from 'next/server';
import { getArticleBySlug } from '@/lib/blog-postgres';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    const blog = await getArticleBySlug(slug);

    if (!blog) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (error: any) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch blog',
      },
      { status: 500 }
    );
  }
}









