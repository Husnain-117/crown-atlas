import { NextRequest, NextResponse } from 'next/server';
import { searchProperties, PropertySearchParams } from '@/lib/db/property-repo';
import { getPgPool } from '@/lib/db';

// Function to convert PostgreSQL property to app format (CANONICAL field names)
function convertDbPropertyToAppFormat(dbProperty: any) {
  // Handle property images - use media_urls if available
  let photos: string[];
  let mainImage: string;

  if (dbProperty.media_urls) {
    try {
      // media_urls is stored as JSON array in database
      photos = typeof dbProperty.media_urls === 'string'
        ? JSON.parse(dbProperty.media_urls)
        : dbProperty.media_urls;
      mainImage = dbProperty.main_photo_url || photos[0] || '';
    } catch {
      // Fallback to main_photo_url if JSON parsing fails
      photos = dbProperty.main_photo_url ? [dbProperty.main_photo_url] : [];
      mainImage = dbProperty.main_photo_url || '';
    }
  } else if (dbProperty.main_photo_url) {
    photos = [dbProperty.main_photo_url];
    mainImage = dbProperty.main_photo_url;
  } else {
    photos = [];
    mainImage = '/placeholder.svg';
  }

  // CANONICAL: Use exact field names from PropertyDetail interface
  return {
    // Primary identifiers
    _id: dbProperty.listing_key,
    id: dbProperty.listing_key,
    listing_key: dbProperty.listing_key,

    // Pricing - CANONICAL
    list_price: dbProperty.list_price || 0,

    // Location - CANONICAL field names
    address: dbProperty.unparsed_address || dbProperty.cleaned_address || "Address not available",
    city: dbProperty.city || "",
    county: dbProperty.state || dbProperty.state_or_province || "", // CANONICAL: county contains state
    postal_code: dbProperty.postal_code || "",
    latitude: dbProperty.latitude || 0,
    longitude: dbProperty.longitude || 0,

    // Property characteristics - CANONICAL field names
    property_type: dbProperty.property_type || "Residential",
    bedrooms: dbProperty.bedrooms_total || null, // CANONICAL: bedrooms
    bathrooms: dbProperty.bathrooms_total || null, // CANONICAL: bathrooms
    living_area_sqft: dbProperty.living_area || null, // CANONICAL: living_area_sqft
    lot_size_sqft: dbProperty.lot_size_sq_ft || 0,
    year_built: dbProperty.year_built,

    // Images - CANONICAL
    images: photos,
    main_image_url: mainImage,
    image: mainImage, // Legacy support

    // Status and metadata
    status: dbProperty.status === "Active" ? "FOR SALE" : (dbProperty.status || "UNKNOWN"),
    statusColor: dbProperty.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800",
    days_on_market: dbProperty.cumulative_days_on_market,

    // Descriptions - CANONICAL
    public_remarks: dbProperty.public_remarks || "",

    // Additional fields
    photosCount: dbProperty.photos_count || 0,
    favorite: false,
    createdAt: dbProperty.listed_at || dbProperty.created_at || new Date().toISOString(),
    updatedAt: dbProperty.modification_timestamp || dbProperty.updated_at || new Date().toISOString(),

    // Legacy fields for backward compatibility
    location: dbProperty.city || "Unknown",
    state: dbProperty.state || dbProperty.state_or_province || "",
    zip_code: dbProperty.postal_code || "",
    publicRemarks: dbProperty.public_remarks || "",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit = 10, filters = {} } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    console.log(`🔍 Semantic search (PostgreSQL) for: "${query}"`);

    // Build PostgreSQL filters based on semantic query
    const requestedFilters = filters && typeof filters === 'object'
      ? filters as Partial<PropertySearchParams>
      : {}
    const searchParams: PropertySearchParams = {
      ...requestedFilters,
      limit: Math.min(Math.max(Number(limit) || 10, 1), 50),
      sort: 'updated'
    };

    // Parse query for semantic meaning and add filters
    const lowerQuery = query.toLowerCase();

    // Price-based filtering
    if (lowerQuery.includes('luxury') || lowerQuery.includes('expensive') || lowerQuery.includes('high-end')) {
      searchParams.minPrice = 500000;
    } else if (lowerQuery.includes('affordable') || lowerQuery.includes('cheap') || lowerQuery.includes('budget')) {
      searchParams.maxPrice = 300000;
    }

    // Property type filtering
    if (lowerQuery.includes('condo') || lowerQuery.includes('condominium')) {
      searchParams.propertyType = 'Condominium';
    } else if (lowerQuery.includes('house') || lowerQuery.includes('home') || lowerQuery.includes('single family')) {
      searchParams.propertyType = 'Residential';
    }

    // Location-based search
    const cityMatch = lowerQuery.match(/in\s+([a-zA-Z\s]+)/);
    if (cityMatch) {
      searchParams.city = cityMatch[1].trim();
    }

    console.log('🔍 PostgreSQL semantic search params:', searchParams);

    // For advanced text search (pool, waterfront, view), use direct SQL query
    let properties;
    let total = 0;

    if (
      lowerQuery.includes('pool') ||
      lowerQuery.includes('waterfront') ||
      lowerQuery.includes('ocean') ||
      lowerQuery.includes('beach') ||
      lowerQuery.includes('view')
    ) {
      // Use advanced text search in public_remarks
      const pool = await getPgPool();
      const searchTerms: string[] = [];

      if (lowerQuery.includes('pool')) searchTerms.push('pool');
      if (lowerQuery.includes('waterfront') || lowerQuery.includes('ocean') || lowerQuery.includes('beach')) {
        searchTerms.push('waterfront', 'ocean', 'beach');
      }
      if (lowerQuery.includes('view')) searchTerms.push('view');

      // Build WHERE clause for text search
      const whereClauses = [`status = 'Active'`, `LOWER(property_type) <> 'land'`];
      const values: any[] = [];

      // Add text search conditions
      if (searchTerms.length > 0) {
        const textConditions = searchTerms.map((term) => {
          values.push(`%${term}%`);
          return `LOWER(public_remarks) LIKE $${values.length}`;
        });
        whereClauses.push(`(${textConditions.join(' OR ')})`);
      }

      // Add other filters from searchParams
      if (searchParams.minPrice) {
        values.push(searchParams.minPrice);
        whereClauses.push(`list_price >= $${values.length}`);
      }
      if (searchParams.maxPrice) {
        values.push(searchParams.maxPrice);
        whereClauses.push(`list_price <= $${values.length}`);
      }
      if (searchParams.propertyType) {
        values.push(`%${searchParams.propertyType}%`);
        whereClauses.push(`LOWER(property_type) LIKE LOWER($${values.length})`);
      }
      if (searchParams.city) {
        values.push(`%${searchParams.city}%`);
        whereClauses.push(`LOWER(city) LIKE LOWER($${values.length})`);
      }

      values.push(limit);
      const limitParam = `$${values.length}`;

      const sql = `
        SELECT
          listing_key, status, mls_status, property_type, photos_count,
          main_photo_url, media_urls, list_price, bedrooms_total, bathrooms_total,
          living_area, city, state_or_province AS state, postal_code, country,
          latitude, longitude, year_built, listing_id, on_market_date AS listed_at,
          modification_timestamp, on_market_date, property_sub_type,
          lot_size_sq_ft, unparsed_address, cleaned_address, public_remarks,
          cumulative_days_on_market, updated_at, created_at
        FROM properties
        WHERE ${whereClauses.join(' AND ')}
        ORDER BY modification_timestamp DESC NULLS LAST
        LIMIT ${limitParam};
      `;

      console.log('🔍 Custom SQL for text search:', { sql: sql.substring(0, 200) + '...', values });

      const result = await pool.query(sql, values);
      properties = result.rows;
      total = properties.length;
    } else {
      // Use standard searchProperties function
      const result = await searchProperties(searchParams);
      properties = result.properties;
      total = result.total;
    }

    console.log(`✅ Found ${properties.length} semantic matches from PostgreSQL`);

    // Convert to app format with proper images
    const convertedProperties = properties.map(convertDbPropertyToAppFormat);

    return NextResponse.json({
      success: true,
      data: convertedProperties,
      meta: {
        totalResults: total,
        searchQuery: query,
        searchTime: Date.now()
      }
    });

  } catch (error: any) {
    console.error('❌ Error in semantic search:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform semantic search',
        message: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Use the same logic as POST
    return await POST(new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ query, limit })
    }));

  } catch (error: any) {
    console.error('❌ Error in semantic search GET:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform semantic search',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
