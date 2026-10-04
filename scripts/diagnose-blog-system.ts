#!/usr/bin/env tsx
/**
 * Blog System Diagnostic Script
 * 
 * Comprehensive analysis of the blog cron job system to identify:
 * 1. Database connectivity issues
 * 2. Recent blog generation activity
 * 3. Missing images
 * 4. Configuration problems
 * 5. API endpoint health
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
});

interface DiagnosticResult {
  section: string;
  status: 'OK' | 'WARNING' | 'ERROR';
  message: string;
  details?: any;
}

const results: DiagnosticResult[] = [];

function log(section: string, status: 'OK' | 'WARNING' | 'ERROR', message: string, details?: any) {
  results.push({ section, status, message, details });
  const emoji = status === 'OK' ? '✅' : status === 'WARNING' ? '⚠️' : '❌';
  console.log(`${emoji} [${section}] ${message}`);
  if (details) {
    console.log('   Details:', JSON.stringify(details, null, 2));
  }
}

async function checkEnvironmentVariables() {
  console.log('\n═══════════════════════════════════════════');
  console.log('1️⃣  ENVIRONMENT VARIABLES CHECK');
  console.log('═══════════════════════════════════════════\n');

  const requiredVars = [
    'DATABASE_URL',
    'OPENAI_API_KEY',
    'PEXELS_API_KEY',
    'CRON_SECRET',
  ];

  const optionalVars = [
    'GOOGLE_SHEET_ID',
    'GOOGLE_CREDENTIALS_PATH',
  ];

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      log('ENV', 'OK', `${varName} is set`);
    } else {
      log('ENV', 'ERROR', `${varName} is MISSING`, { required: true });
    }
  }

  for (const varName of optionalVars) {
    if (process.env[varName]) {
      log('ENV', 'OK', `${varName} is set`);
    } else {
      log('ENV', 'WARNING', `${varName} is not set`, { required: false });
    }
  }
}

async function checkDatabaseConnection() {
  console.log('\n═══════════════════════════════════════════');
  console.log('2️⃣  DATABASE CONNECTION CHECK');
  console.log('═══════════════════════════════════════════\n');

  try {
    const result = await pool.query('SELECT version()');
    log('DATABASE', 'OK', 'PostgreSQL connection successful', {
      version: result.rows[0].version.split(' ').slice(0, 2).join(' ')
    });
  } catch (error: any) {
    log('DATABASE', 'ERROR', 'Failed to connect to PostgreSQL', {
      error: error.message
    });
    return false;
  }

  // Check if articles table exists
  try {
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'articles'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      log('DATABASE', 'OK', 'articles table exists');
    } else {
      log('DATABASE', 'ERROR', 'articles table does NOT exist', {
        solution: 'Run migration: psql $DATABASE_URL -f blog-generator/migrations/001-create-articles-table.sql'
      });
      return false;
    }
  } catch (error: any) {
    log('DATABASE', 'ERROR', 'Failed to check articles table', { error: error.message });
    return false;
  }

  return true;
}

async function checkRecentBlogActivity() {
  console.log('\n═══════════════════════════════════════════');
  console.log('3️⃣  RECENT BLOG ACTIVITY CHECK');
  console.log('═══════════════════════════════════════════\n');

  try {
    // Get total blog count
    const countResult = await pool.query('SELECT COUNT(*) as total FROM articles');
    const totalBlogs = parseInt(countResult.rows[0].total);
    log('ACTIVITY', 'OK', `Total blogs in database: ${totalBlogs}`);

    // Get blogs from last 30 days
    const recentResult = await pool.query(`
      SELECT 
        id,
        meta_title,
        slug,
        city,
        created_at,
        featured_image
      FROM articles 
      WHERE created_at >= NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
    `);

    if (recentResult.rows.length === 0) {
      log('ACTIVITY', 'ERROR', 'NO blogs created in the last 30 days!', {
        lastBlogDate: 'More than 30 days ago'
      });
    } else {
      log('ACTIVITY', 'OK', `${recentResult.rows.length} blogs created in last 30 days`);
      
      console.log('\n   Recent blogs:');
      recentResult.rows.forEach((blog, index) => {
        const daysAgo = Math.floor((Date.now() - new Date(blog.created_at).getTime()) / (1000 * 60 * 60 * 24));
        console.log(`   ${index + 1}. "${blog.meta_title}"`);
        console.log(`      - Created: ${daysAgo} days ago (${blog.created_at.toISOString().split('T')[0]})`);
        console.log(`      - City: ${blog.city}`);
        console.log(`      - Image: ${blog.featured_image || 'MISSING'}`);
        console.log('');
      });
    }

    // Check last 7 days specifically
    const last7DaysResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM articles 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    
    const last7DaysCount = parseInt(last7DaysResult.rows[0].count);
    if (last7DaysCount === 0) {
      log('ACTIVITY', 'ERROR', 'NO blogs created in the last 7 days!', {
        expectedDaily: 1,
        actualWeekly: 0
      });
    } else {
      log('ACTIVITY', 'WARNING', `Only ${last7DaysCount} blog(s) in last 7 days`, {
        expected: '~7 blogs (1 per day)',
        actual: last7DaysCount
      });
    }

  } catch (error: any) {
    log('ACTIVITY', 'ERROR', 'Failed to check blog activity', { error: error.message });
  }
}

async function checkMissingImages() {
  console.log('\n═══════════════════════════════════════════');
  console.log('4️⃣  MISSING IMAGES CHECK');
  console.log('═══════════════════════════════════════════\n');

  try {
    const missingImagesResult = await pool.query(`
      SELECT 
        id,
        meta_title,
        slug,
        city,
        featured_image,
        created_at
      FROM articles 
      WHERE featured_image IS NULL 
         OR featured_image = '' 
         OR featured_image = '/placeholder.jpg'
         OR featured_image = '/images/placeholder-16x9.png'
      ORDER BY created_at DESC
      LIMIT 20
    `);

    if (missingImagesResult.rows.length === 0) {
      log('IMAGES', 'OK', 'All blogs have valid featured images');
    } else {
      log('IMAGES', 'ERROR', `${missingImagesResult.rows.length} blogs have missing/invalid images`, {
        count: missingImagesResult.rows.length
      });

      console.log('\n   Blogs with missing images:');
      missingImagesResult.rows.forEach((blog, index) => {
        console.log(`   ${index + 1}. "${blog.meta_title}"`);
        console.log(`      - ID: ${blog.id}`);
        console.log(`      - Slug: ${blog.slug}`);
        console.log(`      - City: ${blog.city}`);
        console.log(`      - Image: ${blog.featured_image || 'NULL'}`);
        console.log(`      - Created: ${blog.created_at.toISOString().split('T')[0]}`);
        console.log('');
      });
    }
  } catch (error: any) {
    log('IMAGES', 'ERROR', 'Failed to check for missing images', { error: error.message });
  }
}

async function checkCronConfiguration() {
  console.log('\n═══════════════════════════════════════════');
  console.log('5️⃣  CRON CONFIGURATION CHECK');
  console.log('═══════════════════════════════════════════\n');

  // Check if CRON_SECRET is set
  if (!process.env.CRON_SECRET) {
    log('CRON', 'ERROR', 'CRON_SECRET is not set', {
      impact: 'Vercel cron jobs will fail with 401 Unauthorized',
      solution: 'Set CRON_SECRET in Vercel environment variables'
    });
  } else {
    log('CRON', 'OK', 'CRON_SECRET is configured');
  }

  // Check vercel.json configuration
  try {
    const fs = require('fs');
    const path = require('path');
    const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
    
    if (fs.existsSync(vercelConfigPath)) {
      const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
      
      if (vercelConfig.crons && Array.isArray(vercelConfig.crons)) {
        const blogCron = vercelConfig.crons.find((c: any) => 
          c.path === '/api/blogs/generate-scheduled'
        );
        
        if (blogCron) {
          log('CRON', 'OK', 'Blog cron job configured in vercel.json', {
            path: blogCron.path,
            schedule: blogCron.schedule,
            description: 'Runs at 1:00 AM UTC daily'
          });
        } else {
          log('CRON', 'ERROR', 'Blog cron job NOT found in vercel.json', {
            expected: '/api/blogs/generate-scheduled'
          });
        }
      } else {
        log('CRON', 'ERROR', 'No crons configured in vercel.json');
      }
    } else {
      log('CRON', 'WARNING', 'vercel.json not found');
    }
  } catch (error: any) {
    log('CRON', 'ERROR', 'Failed to read vercel.json', { error: error.message });
  }
}

async function checkAPIEndpoint() {
  console.log('\n═══════════════════════════════════════════');
  console.log('6️⃣  API ENDPOINT CHECK');
  console.log('═══════════════════════════════════════════\n');

  const fs = require('fs');
  const path = require('path');
  
  const apiPath = path.join(process.cwd(), 'src', 'app', 'api', 'blogs', 'generate-scheduled', 'route.ts');
  
  if (fs.existsSync(apiPath)) {
    log('API', 'OK', 'API endpoint file exists', { path: apiPath });
    
    // Check if it has proper authorization
    const content = fs.readFileSync(apiPath, 'utf-8');
    if (content.includes('CRON_SECRET')) {
      log('API', 'OK', 'API endpoint has CRON_SECRET authorization check');
    } else {
      log('API', 'WARNING', 'API endpoint may not have proper authorization');
    }
  } else {
    log('API', 'ERROR', 'API endpoint file does NOT exist', { expectedPath: apiPath });
  }
}

async function generateSummaryReport() {
  console.log('\n═══════════════════════════════════════════');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('═══════════════════════════════════════════\n');

  const errors = results.filter(r => r.status === 'ERROR');
  const warnings = results.filter(r => r.status === 'WARNING');
  const oks = results.filter(r => r.status === 'OK');

  console.log(`✅ OK: ${oks.length}`);
  console.log(`⚠️  WARNINGS: ${warnings.length}`);
  console.log(`❌ ERRORS: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n🔴 CRITICAL ISSUES FOUND:');
    errors.forEach((err, index) => {
      console.log(`\n${index + 1}. [${err.section}] ${err.message}`);
      if (err.details) {
        console.log('   Details:', JSON.stringify(err.details, null, 2));
      }
    });
  }

  if (warnings.length > 0) {
    console.log('\n🟡 WARNINGS:');
    warnings.forEach((warn, index) => {
      console.log(`\n${index + 1}. [${warn.section}] ${warn.message}`);
    });
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('🔍 RECOMMENDATIONS');
  console.log('═══════════════════════════════════════════\n');

  if (errors.some(e => e.section === 'ACTIVITY')) {
    console.log('1. Blog generation has stopped - check Vercel cron job logs');
    console.log('   - Go to Vercel Dashboard → Your Project → Logs');
    console.log('   - Filter by "/api/blogs/generate-scheduled"');
    console.log('   - Check for 401 Unauthorized or 500 errors\n');
  }

  if (errors.some(e => e.section === 'IMAGES')) {
    console.log('2. Missing blog images detected');
    console.log('   - Run: npm run backfill-images (if script exists)');
    console.log('   - Or manually update featured_image field in database\n');
  }

  if (errors.some(e => e.section === 'CRON')) {
    console.log('3. CRON_SECRET not configured');
    console.log('   - Generate: openssl rand -hex 32');
    console.log('   - Add to Vercel environment variables');
    console.log('   - Redeploy application\n');
  }
}

async function main() {
  console.log('\n🚀 CROWN COASTAL BLOG SYSTEM DIAGNOSTICS');
  console.log('═══════════════════════════════════════════\n');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);

  try {
    await checkEnvironmentVariables();
    
    const dbOk = await checkDatabaseConnection();
    if (dbOk) {
      await checkRecentBlogActivity();
      await checkMissingImages();
    }
    
    await checkCronConfiguration();
    await checkAPIEndpoint();
    await generateSummaryReport();

  } catch (error: any) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }

  console.log('\n✅ Diagnostic complete!\n');
}

main();
