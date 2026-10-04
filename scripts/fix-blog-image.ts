#!/usr/bin/env tsx
/**
 * Quick fix for blog image - update specific blog with Orange County image
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
});

async function updateBlogImage() {
  console.log('🖼️  Updating blog image...\n');

  try {
    // Update the "Waterfront Living in San Diego" blog (ID: 24)
    const result = await pool.query(
      `UPDATE articles 
       SET featured_image = $1, updated_at = NOW() 
       WHERE id = 24 
       RETURNING id, meta_title, featured_image`,
      ['/County/Orange/DanaPointHarbor.jpg']
    );

    if (result.rows.length > 0) {
      console.log('✅ Blog image updated successfully!');
      console.log('   Blog ID:', result.rows[0].id);
      console.log('   Title:', result.rows[0].meta_title);
      console.log('   New Image:', result.rows[0].featured_image);
    } else {
      console.log('❌ Blog not found with ID 24');
    }

  } catch (error: any) {
    console.error('❌ Error updating blog:', error.message);
  } finally {
    await pool.end();
  }
}

updateBlogImage();
