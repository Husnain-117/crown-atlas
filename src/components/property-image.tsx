'use client'

import Image, { type ImageProps } from 'next/image'
import { forwardRef } from 'react'
import { isPreparedPropertyPhoto, isStoredPropertyPhoto, propertyPhotoLoader } from '@/lib/property-photo'

/** DigitalOcean has already resized these photos; preserve responsive loading from its CDN. */
const PropertyImage = forwardRef<HTMLImageElement, ImageProps>(function PropertyImage(props, ref) {
  const prepared = isPreparedPropertyPhoto(props.src)
  const stored = isStoredPropertyPhoto(props.src)
  return <Image {...props} alt={props.alt} ref={ref} loader={prepared ? propertyPhotoLoader : props.loader}
    unoptimized={prepared ? false : stored || props.unoptimized} />
})
export default PropertyImage
