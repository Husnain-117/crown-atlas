# Generate Static SEO Landing Pages

The infrastructure for clean URL SEO landings already exists at `/[state]/[city]/[slug]`.

## How It Works

Instead of using query parameters like `/properties?maxPrice=625000`, you can create clean URLs like:
- `/california/san-diego/homes-under-700k`
- `/california/los-angeles/luxury-condos`
- `/california/san-francisco/waterfront-properties`

## Step 1: Identify High-Value Landing Pages

Based on search volume and conversion potential, prioritize these landing pages:

### Price-Based Searches (Highest Priority)
```
/california/san-diego/homes-under-500k
/california/san-diego/homes-under-700k
/california/san-diego/homes-under-1m
/california/los-angeles/homes-under-700k
/california/los-angeles/homes-under-1m
/california/san-francisco/homes-under-1m
/california/san-francisco/homes-under-2m
```

### Property Type Searches
```
/california/san-diego/condos
/california/san-diego/luxury-homes
/california/san-diego/waterfront-properties
/california/san-diego/townhouses
/california/los-angeles/condos
/california/los-angeles/luxury-homes
```

### Neighborhood-Specific
```
/california/san-diego/la-jolla-homes
/california/san-diego/downtown-condos
/california/los-angeles/santa-monica-homes
/california/los-angeles/beverly-hills-luxury
```

## Step 2: Generate Content via API

Use the existing landing page generation API:

```bash
# Example: Generate "homes under 700k" page for San Diego
curl -X POST https://your-domain.com/api/landings/generate \
  -H "Content-Type: application/json" \
  -d '{
    "state": "california",
    "city": "san-diego",
    "slug": "homes-under-700k",
    "type": "price-range",
    "filters": {
      "maxPrice": 700000
    }
  }'
```

## Step 3: Batch Generation Script

Create a batch script to generate all high-priority pages:

```javascript
// scripts/batch-generate-landings.js
const cities = [
  { state: 'california', city: 'san-diego' },
  { state: 'california', city: 'los-angeles' },
  { state: 'california', city: 'san-francisco' },
];

const pricePoints = [
  { slug: 'homes-under-500k', maxPrice: 500000 },
  { slug: 'homes-under-700k', maxPrice: 700000 },
  { slug: 'homes-under-1m', maxPrice: 1000000 },
  { slug: 'homes-under-2m', maxPrice: 2000000 },
];

// Generate pages for each city × price combination
for (const { state, city } of cities) {
  for (const { slug, maxPrice } of pricePoints) {
    await generateLandingPage({ state, city, slug, maxPrice });
  }
}
```

## Step 4: Update Internal Links

Replace parametric URLs with clean SEO URLs throughout the site:

### Before (Parametric - Bad for SEO)
```tsx
<Link href="/properties?maxPrice=700000&city=San Diego">
  Homes Under $700K
</Link>
```

### After (Clean URL - Good for SEO)
```tsx
<Link href="/california/san-diego/homes-under-700k">
  Homes Under $700K
</Link>
```

## Benefits

✅ **Better SEO**: Clean URLs rank better and get more clicks
✅ **Better UX**: Users can remember and share URLs easily
✅ **Better CTR**: Clean URLs in search results get 20-30% higher CTR
✅ **Better Indexing**: Search engines prefer static, descriptive URLs
✅ **Better Link Building**: Clean URLs are more shareable

## Expected Impact

- **Organic traffic**: +40-60% increase from better rankings
- **CTR from SERPs**: +20-30% improvement
- **Crawl efficiency**: Cleaner site structure = better crawling
- **User engagement**: Lower bounce rate, higher time on site

## Next Steps

1. Run the generation script for top 20-30 high-value pages
2. Update internal links throughout the site
3. Submit new URLs to Google Search Console
4. Monitor rankings and traffic for new pages
5. Expand to more cities and search terms based on performance
