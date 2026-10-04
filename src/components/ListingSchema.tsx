import { buildListingSchema, type ListingShape } from "@/lib/seo/listing-schema"

export function ListingSchema({ listing }: { listing: ListingShape }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{
    __html: JSON.stringify(buildListingSchema(listing)).replace(/</g, "\\u003c"),
  }} />
}
