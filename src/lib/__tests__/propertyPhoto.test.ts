import assert from 'node:assert/strict'
import { PROPERTY_PHOTO_CDN, isStoredPropertyPhoto, isPreparedPropertyPhoto, propertyPhotoAtWidth } from '../property-photo'
import { buildPropertyMediaUrls } from '../property-normalization'

const url = `${PROPERTY_PHOTO_CDN}/property-photos/v1/123/0123456789abcdef01234567/w1600.webp`
assert.equal(isPreparedPropertyPhoto(url), true)
assert.equal(propertyPhotoAtWidth(url, 320), url.replace('1600', '320'))
assert.equal(propertyPhotoAtWidth(url, 600), url.replace('1600', '768'))
assert.equal(propertyPhotoAtWidth(url, 1920), url)
const legacy = `${PROPERTY_PHOTO_CDN}/properties/123/01.jpg`
assert.equal(isStoredPropertyPhoto(legacy), true)
assert.equal(propertyPhotoAtWidth(legacy, 320), legacy)
assert.equal(isStoredPropertyPhoto(`${PROPERTY_PHOTO_CDN}.evil.test/properties/123/01.jpg`), false)
assert.equal(isStoredPropertyPhoto(`${PROPERTY_PHOTO_CDN}/properties/123/01.jpg?x=1`), false)
assert.deepEqual(buildPropertyMediaUrls({ main_photo_url: legacy, media_urls: [legacy, url] }), [legacy, url])
assert.deepEqual(buildPropertyMediaUrls({ images: ['/api/media?listingKey=123', 'https://api.cotality.com/trestle/Media/a'], photosCount: 10 }), [])
console.log('propertyPhoto.test.ts: all assertions passed')
