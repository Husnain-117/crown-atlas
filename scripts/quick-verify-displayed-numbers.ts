/**
 * Quick verification of displayed county numbers
 * Checks the exact numbers shown in the screenshot
 */

import { getPool } from "../src/lib/db"
import { COUNTIES } from "../src/lib/counties"

async function verifyDisplayedNumbers() {
  console.log("🔍 Verifying displayed county numbers...\n")
  
  const pool = await getPool()
  
  // Counties to verify from screenshot
  const countiesToCheck = [
    { slug: 'san-diego', displayedListings: 4629, displayedMedian: 1061000 },
    { slug: 'los-angeles', displayedListings: 4576, displayedMedian: 1897000 },
    { slug: 'orange', displayedListings: 4114, displayedMedian: 1577000 }
  ]
  
  for (const check of countiesToCheck) {
    const county = COUNTIES.find(c => c.slug === check.slug)
    if (!county) {
      console.log(`❌ County not found: ${check.slug}`)
      continue
    }
    
    console.log(`\n${"=".repeat(80)}`)
    console.log(`📊 ${county.name}`)
    console.log("=".repeat(80))
    
    // Get all zip codes for this county
    const zipCodes: string[] = []
    for (const city of county.cities) {
      if (city.zipCodes && city.zipCodes.length > 0) {
        zipCodes.push(...city.zipCodes)
      }
    }
    
    console.log(`Configured cities: ${county.cities.length}`)
    console.log(`Configured zip codes: ${zipCodes.length}`)
    
    if (zipCodes.length === 0) {
      console.log(`⚠️  No zip codes configured for ${county.name}`)
      continue
    }
    
    // Query 1: Get listing count by zip codes (matches homepage logic)
    const countResult = await pool.query(
      `
        SELECT 
          split_part(postal_code, '-', 1) AS zip,
          COUNT(*)::int AS count
        FROM properties
        WHERE standard_status = 'Active'
          AND property_type NOT IN (
            'Land',
            'ResidentialLease',
            'CommercialLease',
            'CommercialSale',
            'BusinessOpportunity'
          )
          AND LOWER(COALESCE(state_or_province, '')) = 'ca'
          AND split_part(postal_code, '-', 1) = ANY($1)
        GROUP BY split_part(postal_code, '-', 1)
      `,
      [zipCodes]
    )
    
    const totalListings = countResult.rows.reduce((sum, row) => sum + Number(row.count), 0)
    
    // Query 2: Get median price by zip codes (matches homepage logic)
    const medianResult = await pool.query(
      `
        SELECT 
          split_part(postal_code, '-', 1) AS zip,
          COUNT(*)::int AS count,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY list_price) 
            FILTER (WHERE list_price IS NOT NULL AND list_price > 0)::numeric AS median_price
        FROM properties
        WHERE standard_status = 'Active'
          AND property_type NOT IN (
            'Land',
            'ResidentialLease',
            'CommercialLease',
            'CommercialSale',
            'BusinessOpportunity'
          )
          AND LOWER(COALESCE(state_or_province, '')) = 'ca'
          AND split_part(postal_code, '-', 1) = ANY($1)
        GROUP BY split_part(postal_code, '-', 1)
        HAVING COUNT(*) > 0
      `,
      [zipCodes]
    )
    
    // Calculate weighted median
    let totalWeightedPrice = 0
    let totalWeight = 0
    
    for (const row of medianResult.rows) {
      if (row.median_price != null && row.median_price > 0) {
        const median = Math.round(Number(row.median_price))
        const count = Number(row.count)
        totalWeightedPrice += median * count
        totalWeight += count
      }
    }
    
    const calculatedMedian = totalWeight > 0 ? Math.round(totalWeightedPrice / totalWeight) : null
    
    // Compare with displayed values
    console.log(`\n📈 LISTING COUNT:`)
    console.log(`   Displayed: ${check.displayedListings.toLocaleString()}`)
    console.log(`   Calculated: ${totalListings.toLocaleString()}`)
    
    const listingMatch = totalListings === check.displayedListings
    if (listingMatch) {
      console.log(`   ✅ MATCH - Numbers are correct!`)
    } else {
      const diff = Math.abs(totalListings - check.displayedListings)
      const percentDiff = check.displayedListings > 0 
        ? ((diff / check.displayedListings) * 100).toFixed(2)
        : '100'
      console.log(`   ❌ MISMATCH - Difference: ${diff} (${percentDiff}%)`)
    }
    
    console.log(`\n💰 MEDIAN PRICE:`)
    console.log(`   Displayed: $${check.displayedMedian.toLocaleString()}`)
    console.log(`   Calculated: ${calculatedMedian ? '$' + calculatedMedian.toLocaleString() : 'NULL'}`)
    
    if (calculatedMedian) {
      const medianMatch = Math.abs(calculatedMedian - check.displayedMedian) < 1000 // Allow $1k variance due to rounding
      if (medianMatch) {
        console.log(`   ✅ MATCH - Prices are correct!`)
      } else {
        const diff = Math.abs(calculatedMedian - check.displayedMedian)
        const percentDiff = check.displayedMedian > 0
          ? ((diff / check.displayedMedian) * 100).toFixed(2)
          : '100'
        console.log(`   ❌ MISMATCH - Difference: $${diff.toLocaleString()} (${percentDiff}%)`)
      }
    } else {
      console.log(`   ⚠️  No median price calculated`)
    }
    
    // Additional diagnostics
    console.log(`\n🔍 DIAGNOSTICS:`)
    console.log(`   Zip codes with data: ${countResult.rows.length}/${zipCodes.length}`)
    console.log(`   Zip codes with median: ${medianResult.rows.filter(r => r.median_price).length}`)
    
    // Show top 5 zip codes by listing count
    const topZips = countResult.rows
      .sort((a, b) => Number(b.count) - Number(a.count))
      .slice(0, 5)
    
    if (topZips.length > 0) {
      console.log(`\n   Top 5 zip codes by listings:`)
      topZips.forEach((row, i) => {
        const medianRow = medianResult.rows.find(r => r.zip === row.zip)
        const median = medianRow?.median_price 
          ? `$${Math.round(Number(medianRow.median_price)).toLocaleString()}`
          : 'N/A'
        console.log(`   ${i + 1}. ${row.zip}: ${Number(row.count).toLocaleString()} listings, Median: ${median}`)
      })
    }
  }
  
  console.log(`\n${"=".repeat(80)}`)
  console.log("✅ Verification complete")
  console.log("=".repeat(80))
}

verifyDisplayedNumbers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error)
    process.exit(1)
  })
