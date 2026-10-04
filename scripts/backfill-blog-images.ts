#!/usr/bin/env tsx
/**
 * Backfill Missing Blog Images
 * 
 * Fetches images from Pexels for blogs that have placeholder/missing images
 * and updates the database with proper featured images.
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
});

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

interface BlogToFix {
  id: number;
  meta_title: string;
  slug: string;
  city: string;
  featured_image: string | null;
}

async function fetchPexelsImage(city: string, title: string): Promise<string | null> {
  if (!PEXELS_API_KEY) {
    console.error('❌ PEXELS_API_KEY not set - cannot fetch images');
    return null;
  }

  try {
    // Create search query based on city and title keywords
    let query = `${city} california luxury real estate`;
    
    // Add specific keywords from title
    if (title.toLowerCase().includes('waterfront')) {
      query = `${city} waterfront luxury home california`;
    } else if (title.toLowerCase().includes('beachfront') || title.toLowerCase().includes('beach')) {
      query = `${city} beachfront luxury home california`;
    } else if (title.toLowerCase().includes('coastal')) {
      query = `${city} coastal luxury home california`;
    } else if (title.toLowerCase().includes('investment')) {
      query = `${city} luxury real estate investment california`;
    }

    console.log(`   🔍 Searching Pexels: "${query}"`);

    const page = Math.floor(Math.random() * 5) + 1;
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&page=${page}`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error(`   ❌ Pexels API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      const imageUrl = data.photos[0].src.large;
      console.log(`   ✅ Found image: ${imageUrl.substring(0, 60)}...`);
      return imageUrl;
    }

    console.log(`   ⚠️  No images found for query`);
    return null;
  } catch (error: any) {
    console.error(`   ❌ Error fetching from Pexels:`, error.message);
    return null;
  }
}

async function updateBlogImage(blogId: number, imageUrl: string): Promise<boolean> {
  try {
    await pool.query(
      'UPDATE articles SET featured_image = $1, updated_at = NOW() WHERE id = $2',
      [imageUrl, blogId]
    );
    return true;
  } catch (error: any) {
    console.error(`   ❌ Database update failed:`, error.message);
    return false;
  }
}

async function main() {
  console.log('\n🖼️  BLOG IMAGE BACKFILL SCRIPT');
  console.log('═══════════════════════════════════════════\n');

  if (!PEXELS_API_KEY) {
    console.error('❌ PEXELS_API_KEY is not set in environment variables');
    console.error('   Please add it to .env.local and try again\n');
    process.exit(1);
  }

  try {
    // Find blogs with missing/placeholder images
    const result = await pool.query<BlogToFix>(`
      SELECT 
        id,
        meta_title,
        slug,
        city,
        featured_image
      FROM articles 
      WHERE featured_image IS NULL 
         OR featured_image = '' 
         OR featured_image = '/placeholder.jpg'
         OR featured_image = '/images/placeholder-16x9.png'
      ORDER BY created_at DESC
    `);

    const blogsToFix = result.rows;

    if (blogsToFix.length === 0) {
      console.log('✅ All blogs already have valid images!\n');
      return;
    }

    console.log(`Found ${blogsToFix.length} blog(s) with missing images\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < blogsToFix.length; i++) {
      const blog = blogsToFix[i];
      console.log(`\n[${i + 1}/${blogsToFix.length}] Processing: "${blog.meta_title}"`);
      console.log(`   ID: ${blog.id}`);
      console.log(`   City: ${blog.city}`);
      console.log(`   Current image: ${blog.featured_image || 'NULL'}`);

      // Fetch new image from Pexels
      const imageUrl = await fetchPexelsImage(blog.city, blog.meta_title);

      if (imageUrl) {
        // Update database
        const updated = await updateBlogImage(blog.id, imageUrl);
        if (updated) {
          console.log(`   ✅ Updated successfully!`);
          successCount++;
        } else {
          console.log(`   ❌ Failed to update database`);
          failCount++;
        }
      } else {
        console.log(`   ⚠️  Skipping - no image found`);
        failCount++;
      }

      // Rate limiting - wait 1 second between requests
      if (i < blogsToFix.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('📊 BACKFILL SUMMARY');
    console.log('═══════════════════════════════════════════\n');
    console.log(`✅ Successfully updated: ${successCount}`);
    console.log(`❌ Failed/Skipped: ${failCount}`);
    console.log(`📝 Total processed: ${blogsToFix.length}\n`);

  } catch (error: any) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
