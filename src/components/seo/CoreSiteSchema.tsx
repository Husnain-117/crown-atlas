import { getCoreSiteSchema } from "@/lib/seo/site-schema";

export default function CoreSiteSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(getCoreSiteSchema()) }}
    />
  );
}
