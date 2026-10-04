/**
 * Remove Duplicate San Diego "Homes Under $1M" Blogs
 * Run this on the DigitalOcean server where PostgreSQL is hosted
 *
 * Usage: node scripts/cleanup-duplicate-blogs.js
 */

const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool for DigitalOcean droplet
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false, // DigitalOcean droplet doesn't use SSL
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function findDuplicateSanDiegoBlogs() {
  const query = `
    SELECT
      id,
      slug,
      meta_title,
      city,
      created_at,
      updated_at
    FROM articles
    WHERE LOWER(city) = 'san diego'
      AND (
        LOWER(meta_title) LIKE '%homes under%1%m%'
        OR LOWER(meta_title) LIKE '%under%$1%million%'
        OR LOWER(slug) LIKE '%san-diego-homes-under-1-million%'
        OR LOWER(slug) LIKE '%san-diego%under%1m%'
      )
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query);
  return result.rows;
}

async function removeDuplicateBlogs() {
  try {
    console.log('🔍 Finding duplicate San Diego "homes under $1M" blogs...\n');

    const duplicates = await findDuplicateSanDiegoBlogs();

    if (duplicates.length === 0) {
      console.log('✅ No duplicate blogs found.');
      await pool.end();
      return;
    }

    console.log(`Found ${duplicates.length} blog(s) matching criteria:\n`);
    duplicates.forEach((blog, index) => {
      console.log(`${index + 1}. ID: ${blog.id}`);
      console.log(`   Slug: ${blog.slug}`);
      console.log(`   Title: ${blog.meta_title}`);
      console.log(`   Created: ${blog.created_at}`);
      console.log(`   Updated: ${blog.updated_at}\n`);
    });

    if (duplicates.length === 1) {
      console.log('✅ Only one blog found. No duplicates to remove.');
      await pool.end();
      return;
    }

    // Keep the most recent one (first in DESC order)
    const keepBlog = duplicates[0];
    const removeBlogIds = duplicates.slice(1).map(b => b.id);

    console.log(`\n📌 KEEPING: ID ${keepBlog.id} - ${keepBlog.slug}`);
    console.log(`   (Most recent: ${keepBlog.created_at})\n`);

    console.log(`🗑️  REMOVING ${removeBlogIds.length} duplicate(s):`);
    duplicates.slice(1).forEach((blog, index) => {
      console.log(`   ${index + 1}. ID ${blog.id} - ${blog.slug}`);
    });

    // Delete the duplicates
    const deleteQuery = `
      DELETE FROM articles
      WHERE id = ANY($1::int[])
      RETURNING id, slug;
    `;

    const deleteResult = await pool.query(deleteQuery, [removeBlogIds]);

    console.log(`\n✅ Successfully deleted ${deleteResult.rowCount} duplicate blog(s):`);
    deleteResult.rows.forEach((blog) => {
      console.log(`   - ID ${blog.id}: ${blog.slug}`);
    });

    console.log('\n✅ Done! Only one "San Diego homes under $1M" blog remains.');

  } catch (error) {
    console.error('❌ Error removing duplicate blogs:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the script
removeDuplicateBlogs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
