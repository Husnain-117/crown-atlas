/**
 * Server-side property detail data fetching
 * Used for SSR to ensure property data is in initial HTML for SEO
 */

import { cache } from 'react'
import { getPgPool } from '../db'
import {
  buildPropertyMediaUrls,
  toNullableBoolean,
  toNullableNumber,
  toNullableString,
} from '@/lib/property-normalization'
import { isPropertyEntityKey } from '@/lib/property-url'

export interface PropertyDetailData {
  listing_key: string
  property_entity_key?: string | null
  list_price: number
  previous_list_price: number | null
  price_change_timestamp: string | null
  address: string
  city: string
  state: string
  county: string
  postal_code: string
  latitude: number
  longitude: number
  property_type: string
  property_sub_type: string
  bedrooms: number | null
  bathrooms: number | null
  bathrooms_full: number | null
  bathrooms_half: number | null
  living_area_sqft: number | null
  lot_size_sqft: number | null
  lot_size_acres: number | null
  year_built: number | null
  zoning: string | null
  standard_status: string
  mls_status: string
  days_on_market: number | null
  cumulative_days_on_market: number | null
  listing_contract_date: string
  public_remarks: string
  subdivision_name: string
  main_image_url: string
  images: string[]
  photos_count: number
  seo_title: string | null
  meta_description: string | null
  faq_content: string | null
  parking_total: number | null
  garage_size: number | null
  carport_spaces: number | null
  heating: string | null
  cooling: string | null
  security_features: string | null
  parking_features: string | null
  laundry_features: string | null
  school_district: string | null
  elementary_school: string | null
  middle_school: string | null
  high_school: string | null
  stories_total: number | null
  pool_private_yn: boolean
  waterfront_yn: boolean
  view_yn: boolean
  view: string | null
  new_construction_yn: boolean | null
  senior_community_yn: boolean | null
  fireplace_yn: boolean | null
  fireplaces_total: number | null
  association_yn: boolean | null
  association_name: string | null
  hoa_fee: number | null
  hoa_fee_frequency: string | null
  tax_annual_amount: number | null
  tax_year: number | null
  virtual_tour_url: string | null
  interior_features: string | null
  exterior_features: string | null
  pool_features: string | null
  lot_features: string | null
  appliances: string | null
  architectural_style: string | null
  electric: string | null
  sewer: string | null
  water: string | null
  created_at: string | null
  updated_at: string | null
  modification_timestamp: string | null
  // Agent information
  list_agent_full_name: string | null
  list_agent_email: string | null
  list_agent_dre: string | null
  list_agent_phone: string | null
  list_office_name: string | null
  price_history?: Array<{ date: string; price: number; event?: string }> | null
}

/**
 * Fetch property detail by listing key (server-side)
 * Returns null if not found
 */
async function fetchPropertyDetail(listingKey: string): Promise<PropertyDetailData | null> {
  // Validate input before querying
  if (!listingKey || listingKey === 'undefined' || listingKey.trim() === '') {
    console.warn('getPropertyDetail: Invalid listing key provided:', listingKey)
    return null
  }

  try {
    const pool = await getPgPool()
    const query = `
      SELECT *
      FROM properties
      WHERE listing_key = $1 OR property_entity_key = $1
      ORDER BY
        CASE WHEN listing_key = $1 THEN 0 ELSE 1 END,
        CASE WHEN standard_status = 'Active' THEN 0 ELSE 1 END,
        COALESCE(modification_timestamp, updated_at, created_at) DESC NULLS LAST
      LIMIT 1
    `

    const result = await pool.query(query, [listingKey])

    if (result.rows.length === 0) {
      console.log(`getPropertyDetail: Property not found for listing_key: ${listingKey}`)
      if (isPropertyEntityKey(listingKey)) return null
      const { getTrestlePropertyDetail } = await import('../trestle-property-fallback')
      return getTrestlePropertyDetail(listingKey)
    }

    const r = result.rows[0] as Record<string, unknown>
    const images = buildPropertyMediaUrls({
      listingKey: r.listing_key,
      mainPhotoUrl: r.main_photo_url,
      mediaUrls: r.media_urls,
      photosCount: r.photos_count,
    })

    let priceHistory: Array<{ date: string; price: number; event?: string }> | null = null
    if (r.price_history) {
      try {
        priceHistory = typeof r.price_history === 'string'
          ? JSON.parse(r.price_history)
          : r.price_history as Array<{ date: string; price: number; event?: string }>
      } catch { priceHistory = null }
    }

    const rawHoaFee = toNullableNumber(r.hoa_fee ?? r.association_fee)

    return {
      listing_key: toNullableString(r.listing_key) ?? listingKey,
      property_entity_key: toNullableString(r.property_entity_key),
      list_price: toNullableNumber(r.list_price) ?? 0,
      previous_list_price: toNullableNumber(r.original_list_price),
      price_change_timestamp: r.price_change_timestamp ? String(r.price_change_timestamp) : null,
      address: toNullableString(r.unparsed_address) ?? "Address available on request",
      city: toNullableString(r.city) ?? "",
      state: toNullableString(r.state_or_province) ?? "CA",
      county: toNullableString(r.county_or_parish) ?? "",
      postal_code: toNullableString(r.postal_code) ?? "",
      latitude: toNullableNumber(r.latitude) ?? 0,
      longitude: toNullableNumber(r.longitude) ?? 0,
      property_type: toNullableString(r.property_type) ?? "Residential",
      property_sub_type: toNullableString(r.property_sub_type) ?? "",
      bedrooms: toNullableNumber(r.bedrooms_total),
      bathrooms: toNullableNumber(r.bathrooms_total_integer ?? r.bathrooms_total),
      bathrooms_full: toNullableNumber(r.bathrooms_full),
      bathrooms_half: toNullableNumber(r.bathrooms_half),
      living_area_sqft: toNullableNumber(r.living_area),
      lot_size_sqft: toNullableNumber(r.lot_size_sq_ft),
      lot_size_acres: toNullableNumber(r.lot_size_acres),
      year_built: toNullableNumber(r.year_built),
      zoning: toNullableString(r.zoning),
      standard_status: toNullableString(r.standard_status) ?? "",
      mls_status: toNullableString(r.mls_status ?? r.standard_status) ?? "",
      days_on_market: toNullableNumber(r.days_on_market),
      cumulative_days_on_market: toNullableNumber(r.cumulative_days_on_market),
      listing_contract_date: r.listing_contract_date
        ? String(r.listing_contract_date)
        : (r.on_market_date ? String(r.on_market_date) : ""),
      public_remarks: toNullableString(r.public_remarks) ?? "",
      subdivision_name: toNullableString(r.subdivision_name) ?? "",
      main_image_url: images[0] ?? "",
      images,
      photos_count: toNullableNumber(r.photos_count) ?? images.length,
      seo_title: toNullableString(r.seo_title),
      meta_description: toNullableString(r.meta_description),
      faq_content: toNullableString(r.faq_content),
      parking_total: toNullableNumber(r.parking_total),
      garage_size: toNullableNumber(r.garage_spaces),
      carport_spaces: toNullableNumber(r.carport_spaces),
      heating: toNullableString(r.heating),
      cooling: toNullableString(r.cooling),
      security_features: toNullableString(r.security_features),
      parking_features: toNullableString(r.parking_features),
      laundry_features: toNullableString(r.laundry_features),
      school_district: toNullableString(r.school_district ?? r.school_district_name),
      elementary_school: toNullableString(r.elementary_school ?? r.elementary_school_name),
      middle_school: toNullableString(r.middle_school ?? r.middle_school_name),
      high_school: toNullableString(r.high_school ?? r.high_school_name),
      stories_total: toNullableNumber(r.stories_total),
      pool_private_yn: toNullableBoolean(r.pool_private_yn) ?? false,
      waterfront_yn: toNullableBoolean(r.waterfront_yn) ?? false,
      view_yn: toNullableBoolean(r.view_yn) ?? false,
      view: toNullableString(r.view),
      new_construction_yn: toNullableBoolean(r.new_construction_yn),
      senior_community_yn: toNullableBoolean(r.senior_community_yn),
      fireplace_yn: toNullableBoolean(r.fireplace_yn),
      fireplaces_total: toNullableNumber(r.fireplaces_total),
      association_yn: toNullableBoolean(r.association_yn),
      association_name: toNullableString(r.association_name),
      hoa_fee: rawHoaFee != null && rawHoaFee > 0 ? rawHoaFee : null,
      hoa_fee_frequency: toNullableString(r.hoa_fee_frequency),
      tax_annual_amount: toNullableNumber(r.tax_annual_amount),
      tax_year: toNullableNumber(r.tax_year),
      virtual_tour_url: toNullableString(r.virtual_tour_url),
      interior_features: toNullableString(r.interior_features),
      exterior_features: toNullableString(r.exterior_features),
      pool_features: toNullableString(r.pool_features),
      lot_features: toNullableString(r.lot_features),
      appliances: toNullableString(r.appliances),
      architectural_style: toNullableString(r.architectural_style),
      electric: toNullableString(r.electric),
      sewer: toNullableString(r.sewer),
      water: toNullableString(r.water),
      created_at: r.created_at ? String(r.created_at) : null,
      updated_at: r.updated_at ? String(r.updated_at) : null,
      modification_timestamp: r.modification_timestamp ? String(r.modification_timestamp) : null,
      list_agent_full_name: toNullableString(r.listing_agent_full_name),
      list_agent_email: toNullableString(r.listing_agent_email),
      list_agent_dre: toNullableString(r.listing_agent_mlsid),
      list_agent_phone: toNullableString(r.listing_agent_direct_phone ?? r.listing_agent_office_phone),
      list_office_name: toNullableString(r.list_office_name),
      price_history: priceHistory,
    }
  } catch (error) {
    console.error('Error fetching property detail for listing_key:', listingKey, error)
    if (isPropertyEntityKey(listingKey)) throw error
    try {
      const { getTrestlePropertyDetail } = await import('../trestle-property-fallback')
      const fallbackProperty = await getTrestlePropertyDetail(listingKey)
      if (fallbackProperty) return fallbackProperty
    } catch (fallbackError) {
      console.error('Trestle fallback failed for property detail:', listingKey, fallbackError)
    }

    // Do not turn an infrastructure outage into a cached 404. Throwing lets
    // ISR keep serving the last successful page while revalidation is retried.
    throw error
  }
}

// generateMetadata and the page body request the same listing during one render.
// React cache deduplicates that work without making the data stale across requests.
export const getPropertyDetail = cache(fetchPropertyDetail)
