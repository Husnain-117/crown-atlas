import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { authorizeServerRequest } from '@/lib/server-route-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
});

export async function POST(request: Request) {
  const unauthorized = authorizeServerRequest(request, 'admin');
  if (unauthorized) return unauthorized;

  try {
    console.log('[ADMIN] Fixing blog image paths...');

    // Update any blog posts with the incorrect image path
    const updateResult = await pool.query(`
      UPDATE articles
      SET featured_image = '/placeholder.svg'
      WHERE featured_image = '/images/placeholder-16x9.png'
      OR featured_image IS NULL
      OR featured_image = ''
    `);

    console.log(`[ADMIN] Updated ${updateResult.rowCount} blog posts`);

    // Check current state of blog images
    const checkResult = await pool.query(`
      SELECT
        id,
        article_key,
        featured_image,
        CASE
          WHEN featured_image IS NULL OR featured_image = '' THEN 'MISSING'
          WHEN featured_image = '/images/placeholder-16x9.png' THEN 'WRONG PATH'
          WHEN featured_image LIKE 'http%' THEN 'EXTERNAL URL'
          WHEN featured_image LIKE '/%' THEN 'LOCAL PATH'
          ELSE 'UNKNOWN'
        END as status
      FROM articles
      ORDER BY id DESC
      LIMIT 10
    `);

    return NextResponse.json({
      success: true,
      updated: updateResult.rowCount,
      recentPosts: checkResult.rows,
    });
  } catch (error: any) {
    console.error('[ADMIN] Error fixing blog images:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const unauthorized = authorizeServerRequest(request, 'admin');
  if (unauthorized) return unauthorized;

  try {
    const checkResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN featured_image IS NULL OR featured_image = '' THEN 1 END) as missing,
        COUNT(CASE WHEN featured_image = '/images/placeholder-16x9.png' THEN 1 END) as wrong_path,
        COUNT(CASE WHEN featured_image LIKE 'http%' THEN 1 END) as external,
        COUNT(CASE WHEN featured_image LIKE '/%' AND featured_image != '/images/placeholder-16x9.png' THEN 1 END) as local
      FROM articles
    `);

    const recentPosts = await pool.query(`
      SELECT
        id,
        article_key,
        featured_image,
        CASE
          WHEN featured_image IS NULL OR featured_image = '' THEN 'MISSING'
          WHEN featured_image = '/images/placeholder-16x9.png' THEN 'WRONG PATH'
          WHEN featured_image LIKE 'http%' THEN 'EXTERNAL URL'
          WHEN featured_image LIKE '/%' THEN 'LOCAL PATH'
          ELSE 'UNKNOWN'
        END as status
      FROM articles
      ORDER BY id DESC
      LIMIT 10
    `);

    return NextResponse.json({
      success: true,
      stats: checkResult.rows[0],
      recentPosts: recentPosts.rows,
    });
  } catch (error: any) {
    console.error('[ADMIN] Error checking blog images:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
