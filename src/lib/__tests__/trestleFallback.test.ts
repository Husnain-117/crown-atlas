import assert from 'node:assert/strict';
import { normalizeTrestleBaseUrl } from '@/lib/trestle-service';
import { propertyDisplayStatus } from '@/lib/property-status';
import {
  buildTrestleSearchQuery,
  trestlePropertyToListItem,
} from '@/lib/trestle-property-fallback';

assert.equal(
  normalizeTrestleBaseUrl('https://api-trestle.corelogic.com/trestle/odata/'),
  'https://api-trestle.corelogic.com/trestle'
);
assert.equal(
  normalizeTrestleBaseUrl('https://api-trestle.corelogic.com/trestle'),
  'https://api-trestle.corelogic.com/trestle'
);

const query = buildTrestleSearchQuery({
  city: "O'Fallon",
  state: 'CA',
  minPrice: 500_000,
  maxPrice: 2_000_000,
  minBedrooms: 3,
  hasGarage: true,
  hasPool: true,
  isWaterfront: true,
  propertyCategory: 'house',
  sort: 'price_desc',
});

assert.match(query.filter, /City eq 'O''Fallon'/);
assert.match(query.filter, /ListPrice ge 500000/);
assert.match(query.filter, /GarageSpaces gt 0/);
assert.match(query.filter, /PoolPrivateYN eq true/);
assert.match(query.filter, /WaterfrontYN eq true/);
assert.match(query.filter, /PropertyType eq 'Residential'/);
assert.doesNotMatch(query.filter, /Residential Lease/);
assert.match(query.filter, /PropertySubType eq 'SingleFamilyResidence'/);
assert.doesNotMatch(query.filter, /PropertySubType eq '[^']* [^']*'/);
assert.equal(query.orderBy, 'ListPrice desc');

assert.equal(propertyDisplayStatus('Active', 'Residential').label, 'FOR SALE');
assert.equal(propertyDisplayStatus('Active', 'ResidentialLease').label, 'FOR RENT');
assert.equal(propertyDisplayStatus('Closed', 'CommercialLease').label, 'RENTED');
assert.equal(propertyDisplayStatus('ActiveUnderContract', 'Residential').label, 'UNDER CONTRACT');

const item = trestlePropertyToListItem({
  ListingKey: 'test-123',
  ListPrice: 1_250_000,
  UnparsedAddress: '100 Coast Way',
  City: 'San Diego',
  StateOrProvince: 'CA',
  BedroomsTotal: 3,
  BathroomsTotalDecimal: 2.5,
  Media: [
    {
      MediaURL: 'https://media.crmls.org/document-disclosure.pdf',
      MediaCategory: 'Document',
      Order: 0,
    },
    { MediaURL: 'https://media.crmls.org/second.jpg', Order: 2 },
    { MediaURL: 'https://media.crmls.org/first.jpg', Order: 1 },
  ],
});

assert.equal(item.listing_key, 'test-123');
assert.equal(item.bathrooms_total, 2.5);
assert.equal(item.main_photo_url, null);
assert.deepEqual(item.media_urls, []);

console.log('trestleFallback.test.ts: all assertions passed');
