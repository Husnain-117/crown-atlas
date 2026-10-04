import { NextResponse } from "next/server"
import { getPropertyDetail } from "@/lib/db/property-detail-repo"
import {
  applyPublicCacheHeaders,
  PROPERTY_CACHE_TAG,
  PROPERTY_DETAIL_CACHE,
} from "@/lib/cache/public-cache"
import { getRuntimeJson, setRuntimeJson } from "@/lib/cache/vercel-runtime"

function listingKeyFromRequest(request: Request): string {
  const pathname = new URL(request.url).pathname.replace(/\/+$/, "")
  const raw = pathname.split("/").at(-1) ?? ""
  try {
    return decodeURIComponent(raw).trim()
  } catch {
    return raw.trim()
  }
}

export async function GET(request: Request) {
  const startedAt = Date.now()
  const listingKey = listingKeyFromRequest(request)

  if (!listingKey || listingKey === "undefined") {
    return NextResponse.json(
      { success: false, error: "Valid listing key is required" },
      { status: 400 },
    )
  }

  try {
    const cacheKey = `property-detail:v2:${listingKey}`
    const cacheTags = [PROPERTY_CACHE_TAG, `property-${listingKey}`]
    const cached = await getRuntimeJson<{ success: true; data: unknown }>(cacheKey)

    if (cached) {
      return applyPublicCacheHeaders(NextResponse.json(cached), {
        ...PROPERTY_DETAIL_CACHE,
        tags: cacheTags,
        status: "VERCEL_RUNTIME_HIT",
      })
    }

    const property = await getPropertyDetail(listingKey)
    if (!property) {
      return NextResponse.json(
        { success: false, error: "Property not found" },
        { status: 404 },
      )
    }

    const detail = {
      _id: property.listing_key,
      listing_key: property.listing_key,
      listing_id: property.listing_key,
      list_price: property.list_price,
      current_price: property.list_price,
      previous_list_price: property.previous_list_price,
      price_change_timestamp: property.price_change_timestamp,
      lease_amount: null,
      lease_amount_frequency: null,

      address: property.address,
      city: property.city,
      state: property.state,
      county: property.county,
      postal_code: property.postal_code,
      latitude: property.latitude,
      longitude: property.longitude,

      property_type: property.property_type,
      property_sub_type: property.property_sub_type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      bathrooms_full: property.bathrooms_full,
      bathrooms_half: property.bathrooms_half,
      living_area_sqft: property.living_area_sqft,
      lot_size_sqft: property.lot_size_sqft,
      lot_size_acres: property.lot_size_acres,
      year_built: property.year_built,
      zoning: property.zoning,
      status: property.standard_status,
      standard_status: property.standard_status,
      mls_status: property.mls_status,
      days_on_market: property.days_on_market,
      cumulative_days_on_market: property.cumulative_days_on_market,

      listing_contract_date: property.listing_contract_date,
      public_remarks: property.public_remarks,
      subdivision_name: property.subdivision_name,
      main_photo_url: property.main_image_url || null,
      main_image_url: property.main_image_url || null,
      images: property.images,
      photosCount: property.photos_count,

      list_agent_full_name: property.list_agent_full_name || "Crown Coastal Homes",
      list_agent_email: property.list_agent_email || "",
      list_agent_phone: property.list_agent_phone || "",
      list_agent_dre: property.list_agent_dre,
      list_office_name: property.list_office_name || "Crown Coastal Homes",

      modification_timestamp: property.modification_timestamp || property.updated_at || "",
      on_market_timestamp: property.listing_contract_date,
      VirtualTourURLUnbranded: property.virtual_tour_url,
      virtual_tour_url: property.virtual_tour_url,
      view: property.view || (property.view_yn ? "Yes" : ""),
      view_yn: property.view_yn,

      Utilities: [
        property.heating && `Heating: ${property.heating}`,
        property.cooling && `Cooling: ${property.cooling}`,
        property.water && `Water: ${property.water}`,
        property.sewer && `Sewer: ${property.sewer}`,
        property.electric && `Electric: ${property.electric}`,
      ].filter(Boolean).join(", ") || null,
      LotFeatures: property.lot_features,

      school_district: property.school_district,
      elementary_school: property.elementary_school,
      middle_school: property.middle_school,
      high_school: property.high_school,

      pool_private_yn: property.pool_private_yn,
      waterfront_yn: property.waterfront_yn,
      new_construction_yn: property.new_construction_yn,
      senior_community_yn: property.senior_community_yn,
      fireplace_yn: property.fireplace_yn,
      fireplaces_total: property.fireplaces_total,
      association_yn: property.association_yn,
      association_name: property.association_name,

      hoa_fee: property.hoa_fee,
      hoa_fee_frequency: property.hoa_fee_frequency,
      tax_annual_amount: property.tax_annual_amount,
      tax_year: property.tax_year,
      price_history: property.price_history,

      seo_title: property.seo_title,
      meta_description: property.meta_description,
      faq_content: property.faq_content,
      h1_heading: null,
      amenities_content: null,
      page_content: null,
      title: null,
      other_info: {},

      interior_features: property.interior_features || "",
      exterior_features: property.exterior_features || "",
      stories: property.stories_total,
      stories_total: property.stories_total,
      pool_features: property.pool_features || "",
      parking_total: property.parking_total,
      garage_size: property.garage_size,
      carport_spaces: property.carport_spaces,
      heating: property.heating || "",
      cooling: property.cooling || "",
      security_features: property.security_features || "",
      parking_features: property.parking_features || "",
      appliances: property.appliances || "",
      architectural_style: property.architectural_style || "",
      laundry_features: property.laundry_features || "",
    }

    const payload = { success: true as const, data: detail }
    await setRuntimeJson(cacheKey, payload, {
      ttlSeconds: PROPERTY_DETAIL_CACHE.ttlSeconds,
      tags: cacheTags,
      name: "property-detail",
    })

    console.log(`[API] Property ${listingKey} served in ${Date.now() - startedAt}ms`)
    return applyPublicCacheHeaders(NextResponse.json(payload), {
      ...PROPERTY_DETAIL_CACHE,
      tags: cacheTags,
      status: "MISS",
    })
  } catch (error) {
    console.error(`[API] Failed to fetch property ${listingKey}`, error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch property",
        message: process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : undefined,
      },
      { status: 500 },
    )
  }
}
