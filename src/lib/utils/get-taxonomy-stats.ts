import { getPool } from "@/lib/db";

export interface TaxonomyStats {
  houses_count: number;
  condos_count: number;
  townhomes_count: number;
  under_300k_count: number;
  under_500k_count: number; // Used for $300K - $500K range (component uses this incorrectly, but we'll match it)
  under_750k_count: number;
  under_1m_count: number;
  under_2m_count: number;
  over_2m_count: number;
  pool_count: number;
  waterfront_count: number;
  ocean_view_count: number;
  single_story_count: number;
  garage_count: number;
  studio_count: number;
  one_bed_count: number;
  two_bed_count: number;
  three_bed_count: number;
  four_plus_bed_count: number;
  top_neighborhoods: Array<{
    name: string;
    slug: string;
    count: number;
    avg_price: number;
  }>;
}

/**
 * Get real-time taxonomy statistics for a city from the database
 * This queries the properties table directly to ensure accurate counts
 */
export async function getTaxonomyStats(cityName: string): Promise<TaxonomyStats | null> {
  try {
    const pool = await getPool();
    
    // Base WHERE clause for active for-sale residential properties in the city
    // Uses exact city match to align with city_statistics and search page counts
    const baseWhere = `
      WHERE standard_status = 'Active'
        AND property_type NOT IN ('Land', 'ResidentialLease', 'CommercialLease', 'CommercialSale', 'BusinessOpportunity')
        AND LOWER(city) = LOWER($1)
        AND list_price > 0
        AND list_price IS NOT NULL
    `;

    const cityParam = cityName;
    
    // Run all queries in parallel for performance
    const [
      propertyTypesResult,
      priceRangesResult,
      featuresResult,
      bedroomsResult,
      neighborhoodsResult,
    ] = await Promise.all([
      // Property Types - based on property_sub_type (all condos/houses share property_type='Residential')
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE LOWER(property_sub_type) IN ('singlefamilyresidence','single family residence','cabin','farm'))::int AS houses_count,
          COUNT(*) FILTER (WHERE LOWER(property_sub_type) IN ('condominium','stock cooperative','loft','studio'))::int AS condos_count,
          COUNT(*) FILTER (WHERE LOWER(property_sub_type) = 'townhouse')::int AS townhomes_count
        FROM properties
        ${baseWhere}
      `, [cityParam]),
      
      // Price Ranges (matching TaxonomyLinks component expectations)
      // Note: Component uses under_500k_count for $300K-$500K range, so we calculate that range
      pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE list_price < 300000)::int AS under_300k_count,
          COUNT(*) FILTER (WHERE list_price >= 300000 AND list_price < 500000)::int AS under_500k_count,
          COUNT(*) FILTER (WHERE list_price >= 500000 AND list_price < 750000)::int AS under_750k_count,
          COUNT(*) FILTER (WHERE list_price >= 750000 AND list_price < 1000000)::int AS under_1m_count,
          COUNT(*) FILTER (WHERE list_price >= 1000000 AND list_price < 2000000)::int AS under_2m_count,
          COUNT(*) FILTER (WHERE list_price >= 2000000)::int AS over_2m_count
        FROM properties
        ${baseWhere}
      `, [cityParam]),
      
      // Features
      pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE pool_private_yn = true)::int AS pool_count,
          COUNT(*) FILTER (WHERE waterfront_yn = true)::int AS waterfront_count,
          COUNT(*) FILTER (WHERE view_yn = true)::int AS ocean_view_count,
          COUNT(*) FILTER (WHERE stories_total = 1)::int AS single_story_count,
          COUNT(*) FILTER (WHERE garage_spaces > 0 OR parking_total > 0)::int AS garage_count
        FROM properties
        ${baseWhere}
      `, [cityParam]),
      
      // Bedrooms
      pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE bedrooms_total = 0 OR bedrooms_total IS NULL)::int AS studio_count,
          COUNT(*) FILTER (WHERE bedrooms_total = 1)::int AS one_bed_count,
          COUNT(*) FILTER (WHERE bedrooms_total = 2)::int AS two_bed_count,
          COUNT(*) FILTER (WHERE bedrooms_total = 3)::int AS three_bed_count,
          COUNT(*) FILTER (WHERE bedrooms_total >= 4)::int AS four_plus_bed_count
        FROM properties
        ${baseWhere}
      `, [cityParam]),
      
      // Top Neighborhoods (top 12 by count) - using subdivision_name
      pool.query(`
        SELECT 
          COALESCE(subdivision_name, city, 'Unknown') AS name,
          LOWER(REPLACE(REPLACE(REPLACE(COALESCE(subdivision_name, city, 'Unknown'), ' ', '-'), '''', ''), '.', '')) AS slug,
          COUNT(*)::int AS count,
          ROUND(AVG(list_price))::int AS avg_price
        FROM properties
        ${baseWhere}
        GROUP BY COALESCE(subdivision_name, city, 'Unknown')
        HAVING COUNT(*) > 0
        ORDER BY count DESC, avg_price DESC
        LIMIT 12
      `, [cityParam]),
    ]);
    
    const propertyTypes = propertyTypesResult.rows[0] || {};
    const priceRanges = priceRangesResult.rows[0] || {};
    const features = featuresResult.rows[0] || {};
    const bedrooms = bedroomsResult.rows[0] || {};
    const neighborhoods = neighborhoodsResult.rows || [];
    
    return {
      houses_count: propertyTypes.houses_count || 0,
      condos_count: propertyTypes.condos_count || 0,
      townhomes_count: propertyTypes.townhomes_count || 0,
      under_300k_count: priceRanges.under_300k_count || 0,
      under_500k_count: priceRanges.under_500k_count || 0,
      under_750k_count: priceRanges.under_750k_count || 0,
      under_1m_count: priceRanges.under_1m_count || 0,
      under_2m_count: priceRanges.under_2m_count || 0,
      over_2m_count: priceRanges.over_2m_count || 0,
      pool_count: features.pool_count || 0,
      waterfront_count: features.waterfront_count || 0,
      ocean_view_count: features.ocean_view_count || 0,
      single_story_count: features.single_story_count || 0,
      garage_count: features.garage_count || 0,
      studio_count: bedrooms.studio_count || 0,
      one_bed_count: bedrooms.one_bed_count || 0,
      two_bed_count: bedrooms.two_bed_count || 0,
      three_bed_count: bedrooms.three_bed_count || 0,
      four_plus_bed_count: bedrooms.four_plus_bed_count || 0,
      top_neighborhoods: neighborhoods.map((n: any) => ({
        name: n.name,
        slug: n.slug,
        count: n.count,
        avg_price: n.avg_price || 0,
      })),
    };
  } catch (error) {
    console.error('[getTaxonomyStats] Error fetching taxonomy stats:', error);
    return null;
  }
}

