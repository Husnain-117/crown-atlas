import { NextRequest, NextResponse } from 'next/server';
import { searchProperties } from '@/lib/db/property-repo';
import { deriveDisplayName } from '@/lib/display-name';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Sanitize address to remove leading zeros and extra whitespace
function sanitizeAddress(addr: string): string {
  return addr.trim().replace(/^0+\s+/, '').replace(/\s{2,}/g, ' ');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    console.log('🏠 Listings API: Fetching from Postgres...');

    // Extract query parameters
    const county = searchParams.get('county');
    const skip = searchParams.get('skip') ? Number(searchParams.get('skip')) : 0;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 100;

    if (!county) {
      return NextResponse.json(
        { error: 'County parameter is required' },
        { status: 400 }
      );
    }

    // Search properties by county (using city parameter which searches multiple fields)
    const result = await searchProperties({
      city: county, // The searchProperties function searches across city, state, and county fields
      limit,
      offset: skip,
      sort: 'updated',
    });

    const listings = result.properties.map((p: any) => {
      // Address derivation: DB returns unparsed_address; use cleaned_address or address if present
      let baseAddress = (p as any).address || (p as any).cleaned_address || (p as any).unparsed_address || '';
      if (!baseAddress) {
        const raw = (p as any).raw_json;
        try {
          let parsed = raw;
          if (parsed && typeof parsed === 'string') {
            try {
              parsed = JSON.parse(parsed);
            } catch {}
          }
          if (parsed) {
            baseAddress = parsed.UnparsedAddress || parsed.unparsed_address || '';
            if (!baseAddress) {
              const num = parsed.StreetNumber || parsed.street_number || parsed.StreetNumberNumeric || '';
              const name = parsed.StreetName || parsed.street_name || '';
              const suffix = parsed.StreetSuffix || parsed.street_suffix || '';
              const unit = parsed.UnitNumber || parsed.unit_number || '';
              const pieces = [num, name, suffix].filter(Boolean).join(' ').trim();
              if (pieces) baseAddress = pieces + (unit ? ` #${unit}` : '');
            }
          }
        } catch {}
      }

      // Handle property images
      let photos: string[] = [];
      let mainImage: string = '';

      if (p.media_urls) {
        try {
          photos = typeof p.media_urls === 'string' ? JSON.parse(p.media_urls) : p.media_urls;
          mainImage = p.main_photo_url || photos[0] || '';
        } catch {
          photos = p.main_photo_url ? [p.main_photo_url] : [];
          mainImage = p.main_photo_url || '';
        }
      } else if (p.main_photo_url) {
        photos = [p.main_photo_url];
        mainImage = p.main_photo_url;
      }

      // Do not represent a listing with a photo of a different property.
      if (!mainImage && photos.length === 0) {
        mainImage = '/placeholder.svg';
      }

      const item = {
        _id: p.listing_key,
        id: p.listing_key,
        listing_key: p.listing_key,
        list_price: p.list_price || 0,
        address: sanitizeAddress(baseAddress),
        city: p.city,
        county: p.state_or_province,
        postal_code: (p as any).postal_code || '',
        latitude: p.latitude || 0,
        longitude: p.longitude || 0,
        property_type: p.property_type,
        property_category: p.property_sub_type,
        bedrooms: p.bedrooms_total || null,
        bathrooms: p.bathrooms_total || null,
        living_area_sqft: p.living_area || null,
        lot_size_sqft: p.lot_size_sq_ft || p.lot_size_sqft || 0,
        year_built: (p as any).year_built,
        images: photos,
        main_image_url: mainImage,
        image: mainImage,
        status: p.status === 'Active' ? 'FOR SALE' : (p.status || 'UNKNOWN'),
        statusColor: p.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
        days_on_market: (p as any).days_on_market,
        public_remarks: (p as any).public_remarks || '',
        h1_heading: (p as any).h1_heading,
        title: (p as any).title,
        seo_title: (p as any).seo_title,
        photosCount: photos.length || p.photos_count || 0,
        favorite: false,
        createdAt: p.created_at || new Date().toISOString(),
        updatedAt: p.updated_at || new Date().toISOString(),
        location: p.city,
        state: p.state_or_province,
        zip_code: (p as any).postal_code || '',
        publicRemarks: (p as any).public_remarks || '',
      };

      (item as any).display_name = deriveDisplayName({
        listing_key: p.listing_key,
        address: item.address,
        city: item.city,
        state: item.state,
        county: item.county,
        raw_json: (p as any).raw_json,
      });

      return item;
    });

    return NextResponse.json({
      success: true,
      listings,
      total: result.total,
      skip,
      limit,
    });
  } catch (error: any) {
    console.error('❌ Error fetching listings from Postgres:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch listings',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
