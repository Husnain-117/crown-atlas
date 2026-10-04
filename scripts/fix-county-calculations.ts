/**
 * Script to fix county-level calculation issues
 * This addresses:
 * 1. Proper weighted median calculation
 * 2. Correct price per sq ft averaging
 * 3. Accurate days on market calculation
 * 4. Consistent data aggregation methods
 */

import { getPool } from "../src/lib/db"
import { COUNTIES } from "../src/lib/counties"
import { getCityListingMetrics } from "../src/lib/city-metrics"

interface FixedCountyMetrics {
  county: string
  activeListings: number
  medianPrice: number | null
  pricePerSqFt: number | null
  avgDaysOnMarket: number | null
  housesForSale: number
  condosForSale: number
  homesUnder1M: number
  propertiesWithPool: number
}

async function calculateCountyMetrics(countySlug: string): Promise<FixedCountyMetrics> {
  const pool = await getPool()
  const county = COUNTIES.find(c => c.slug === countySlug)
  
  if (!county) {
    throw new Error(`County ${countySlug} not found`)
  }
  
  // Get metrics for all cities in the county
  const cityMetrics = await Promise.all(
    county.cities.map(async (city) => {
      const metrics = await getCityListingMetrics({ citySlug: city.slug, countySlug })
      return { city, metrics }
    })
  )
  
  // Calculate total active listings
  const activeListings = cityMetrics.reduce((sum, c) => sum + c.metrics.totalSales, 0)
  
  // Calculate proper weighted median
  let weightedMedian: number | null = null
  const validCities = cityMetrics.filter(c => c.metrics.medianSalePrice !== null && c.metrics.totalSales > 0)
  
  if (validCities.length > 0) {
    // Create an array of all prices weighted by listing count
    const allPrices: number[] = []
    validCities.forEach(({ metrics }) => {
      // Add each city's median price multiple times based on their listing count
      // Cap at 100 to prevent extreme skew from large cities
      const weight = Math.min(metrics.totalSales, 100)
      for (let i = 0; i < weight; i++) {
        allPrices.push(metrics.medianSalePrice!)
      }
    })
    
    // Calculate median from the weighted array
    allPrices.sort((a, b) => a - b)
    const mid = Math.floor(allPrices.length / 2)
    weightedMedian = allPrices.length % 2 === 0 
      ? (allPrices[mid - 1] + allPrices[mid]) / 2 
      : allPrices[mid]
  }
  
  // Fetch detailed statistics from city_statistics table
  const cityNames = county.cities.map(c => c.name)
  const citySlugs = county.cities.map(c => c.slug)
  
  const statsResult = await pool.query(`
    SELECT 
      price_per_sqft,
      median_days_on_market,
      houses_count,
      condos_count,
      under_300k_count,
      under_500k_count,
      under_750k_count,
      under_1m_count,
      pool_count,
      city_name,
      city_slug
    FROM city_statistics
    WHERE city_name = ANY($1) OR city_slug = ANY($2)
  `, [cityNames, citySlugs])
  
  // Create a map for city listing counts
  const cityListingCounts = new Map()
  cityMetrics.forEach(({ city, metrics }) => {
    cityListingCounts.set(city.slug, metrics.totalSales)
    cityListingCounts.set(city.name, metrics.totalSales)
  })
  
  // Calculate weighted averages
  let totalPricePerSqFt = 0
  let totalSqFtWeight = 0
  let totalDays = 0
  let totalDaysWeight = 0
  
  let housesForSale = 0
  let condosForSale = 0
  let homesUnder1M = 0
  let propertiesWithPool = 0
  
  statsResult.rows.forEach(row => {
    const listingCount = cityListingCounts.get(row.city_slug) || cityListingCounts.get(row.city_name) || 1
    
    // Weighted price per sq ft
    if (row.price_per_sqft != null && row.price_per_sqft > 0) {
      totalPricePerSqFt += row.price_per_sqft * listingCount
      totalSqFtWeight += listingCount
    }
    
    // Weighted days on market
    if (row.median_days_on_market != null && row.median_days_on_market > 0) {
      totalDays += row.median_days_on_market * listingCount
      totalDaysWeight += listingCount
    }
    
    // Simple sums for other metrics
    housesForSale += row.houses_count || 0
    condosForSale += row.condos_count || 0
    homesUnder1M += (row.under_300k_count || 0) + (row.under_500k_count || 0) + 
                   (row.under_750k_count || 0) + (row.under_1m_count || 0)
    propertiesWithPool += row.pool_count || 0
  })
  
  return {
    county: county.name,
    activeListings,
    medianPrice: weightedMedian,
    pricePerSqFt: totalSqFtWeight > 0 ? Math.round(totalPricePerSqFt / totalSqFtWeight) : null,
    avgDaysOnMarket: totalDaysWeight > 0 ? Math.round(totalDays / totalDaysWeight) : null,
    housesForSale,
    condosForSale,
    homesUnder1M,
    propertiesWithPool
  }
}

async function fixAllCounties() {
  console.log("🔧 Fixing county calculations for all primary counties...\n")
  
  const counties = COUNTIES
  const results: FixedCountyMetrics[] = []
  
  for (const county of counties) {
    try {
      console.log(`Processing ${county.name}...`)
      const metrics = await calculateCountyMetrics(county.slug)
      results.push(metrics)
      
      console.log(`  Active Listings: ${metrics.activeListings.toLocaleString()}`)
      console.log(`  Median Price: ${metrics.medianPrice ? `$${metrics.medianPrice.toLocaleString()}` : 'N/A'}`)
      console.log(`  Price/SqFt: ${metrics.pricePerSqFt ? `$${metrics.pricePerSqFt.toLocaleString()}` : 'N/A'}`)
      console.log(`  Days on Market: ${metrics.avgDaysOnMarket ? `${metrics.avgDaysOnMarket} days` : 'N/A'}`)
      console.log(`  Houses: ${metrics.housesForSale.toLocaleString()}`)
      console.log(`  Condos: ${metrics.condosForSale.toLocaleString()}`)
      console.log(`  Under $1M: ${metrics.homesUnder1M.toLocaleString()}`)
      console.log(`  With Pool: ${metrics.propertiesWithPool.toLocaleString()}`)
      
    } catch (error) {
      console.error(`  ❌ Error: ${error}`)
    }
  }
  
  // Generate comparison report
  console.log("\n\n📊 COMPARISON REPORT")
  console.log("====================")
  
  console.log("County | Active | Median | $/sqft | DOM")
  console.log("-------|--------|--------|--------|----")
  
  results.forEach(r => {
    const active = r.activeListings.toLocaleString()
    const median = r.medianPrice ? `$${(r.medianPrice / 1000).toFixed(0)}k` : 'N/A'
    const psf = r.pricePerSqFt ? `$${r.pricePerSqFt}` : 'N/A'
    const dom = r.avgDaysOnMarket ? `${r.avgDaysOnMarket}` : 'N/A'
    
    console.log(`${r.county.padEnd(7)} | ${active.padStart(6)} | ${median.padStart(6)} | ${psf.padStart(6)} | ${dom.padStart(3)}`)
  })
  
  // Identify potential issues
  console.log("\n\n🚨 POTENTIAL ISSUES")
  console.log("===================")
  
  results.forEach(r => {
    const issues = []
    
    if (r.activeListings === 0) {
      issues.push("No active listings")
    }
    
    if (r.medianPrice === null && r.activeListings > 0) {
      issues.push("Null median price despite listings")
    }
    
    if (r.pricePerSqFt === null && r.activeListings > 0) {
      issues.push("Null price per sq ft despite listings")
    }
    
    if (r.housesForSale === 0 && r.condosForSale === 0 && r.activeListings > 0) {
      issues.push("No houses/condos counted despite active listings")
    }
    
    if (issues.length > 0) {
      console.log(`\n${r.county}:`)
      issues.forEach(issue => console.log(`  - ${issue}`))
    }
  })
}

// Run the fix
fixAllCounties().catch(console.error)
