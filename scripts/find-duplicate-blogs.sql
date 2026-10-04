-- Script to find duplicate/similar blog posts that may be cannibalizing keywords
-- Run this against your PostgreSQL database to identify posts to consolidate

-- 1. Find blog posts with very similar titles (potential duplicates)
SELECT
  id,
  slug,
  meta_title,
  city,
  created_at,
  updated_at
FROM articles
WHERE LOWER(meta_title) LIKE '%homes under%1%m%'
   OR LOWER(meta_title) LIKE '%under%$1%million%'
   OR LOWER(meta_title) LIKE '%affordable homes%'
ORDER BY city, created_at DESC;

-- 2. Find posts competing for the same keywords in the same city
SELECT
  city,
  COUNT(*) as post_count,
  STRING_AGG(meta_title, ' | ') as titles,
  STRING_AGG(slug, ', ') as slugs
FROM articles
WHERE LOWER(meta_title) LIKE '%under%1%'
   OR LOWER(meta_title) LIKE '%affordable%'
GROUP BY city
HAVING COUNT(*) > 1
ORDER BY post_count DESC;

-- 3. Identify the "best" post to keep (most recent, or manually choose)
-- Keep the post with:
--   - Most recent created_at OR updated_at
--   - Best performing (if you have analytics)
--   - Most comprehensive content

-- 4. After identifying duplicates, consolidate by:
--   a) Choosing the best post as canonical
--   b) Adding 301 redirects from duplicates to canonical (in next.config.ts)
--   c) Optionally deleting duplicate posts from database

-- Example 301 redirect to add in next.config.ts:
-- {
--   source: '/blogs/old-duplicate-slug',
--   destination: '/blogs/canonical-slug',
--   permanent: true,
-- },

-- To delete duplicate posts (CAREFUL - backup first!):
-- DELETE FROM articles WHERE slug IN ('duplicate-slug-1', 'duplicate-slug-2');
